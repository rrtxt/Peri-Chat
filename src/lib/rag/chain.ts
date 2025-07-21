import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getRetriever } from "./retriever";
import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";
import { Document } from "langchain/document";
import { gemmaPromptTemplate, gemmaToolPromptTemplate } from "./prompt";
import { tavilySearchTool } from "../tools/searchTools";
import { generateToolSchema } from "@/utils/toolUtils";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  model: "gemma-3-27b-it",
  temperature: 0.5,
  topK: 40,
});

const tools = [tavilySearchTool];
const tools_schema = tools.map((tool) => generateToolSchema(tool));
const tools_schema_str = tools_schema
  .map(
    (schema) =>
      `${schema.name}: ${schema.description}\nParameters: ${JSON.stringify(
        schema.parameters,
        null,
        2
      )}`
  )
  .join("\n\n");

console.log(
  "Expected Schema: ",
  generateToolSchema(tavilySearchTool).parameters
);

const tool_registry = Object.fromEntries(
  tools.map((tool) => [tool.name, (args: any) => tool.invoke(args)])
);

type InputState = {
  question: string;
};

const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
  tool_call: Annotation<any>,
});

const retrievalNode = async (state: InputState) => {
  const retrievedDocs = await getRetriever().invoke(state.question);

  // Transform the document content to include metadata
  const transformedDocs = retrievedDocs.map((doc) => {
    const name = doc.metadata["name"] ?? "Unknown TWS";
    const price = doc.metadata["price"] ?? "N/A";
    // const sound = doc.metadata["Overall Sound"] ?? "N/A";
    const content = `Name: ${name} \nPrice: ${price}\nDesc: ${doc.pageContent}\n\n`;

    return new Document({
      pageContent: content,
      metadata: doc.metadata,
    });
  });

  return {
    context: transformedDocs,
  };
};

const toolsDecisionNode = async (state: typeof StateAnnotation.State) => {
  try {
    const question = state.question;
    const context = state.context.map((doc) => doc.pageContent).join("\n");
    console.log("Tool Schema Str", tools_schema_str);

    const toolPrompt = await gemmaToolPromptTemplate.invoke({
      context: context,
      format: `{"name": function name, "parameters": dictionary of argument name and its value}`,
      question: question,
      functions: tools_schema_str,
    });

    console.log("Tool Prompt: ", toolPrompt);

    // Decide if should use tool or not
    const response = await llm.invoke(toolPrompt);
    console.log("Response Tools ", response.content);
    const cleaned = response.content
      .toString()
      .replace("```json\n", "")
      .replace("\n```", "")
      .replace(/```/g, "");

    if (cleaned == "no_tool") {
      return { tool_call: null };
    }

    // Parse tool into json format
    const tool_json = JSON.parse(cleaned);

    console.log(`Tools : ${response.content}\n Tool Object ${tool_json}`);
    return { tool_call: tool_json };
  } catch (error) {
    console.error("Error executing tool:", error);
    return { tool_call: null };
  }
};

const shouldUseTool = (state: typeof StateAnnotation.State) => {
  return state.tool_call ? "tool" : "generate";
};

const toolNode = async (state: typeof StateAnnotation.State) => {
  let context;
  try {
    const tool = state.tool_call;

    if (!tool) {
      throw new Error("No tool call found in state");
    }

    // Check if tool exists in registry
    if (!tool_registry[tool.name]) {
      throw new Error(`Tool "${tool.name}" not found in registry`);
    }

    // Execute the tool
    console.log("parameter used :", tool.parameters);
    const cleanParams = Object.fromEntries(
      Object.entries(tool.parameters).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    );
    const result = await tool_registry[tool.name](cleanParams);

    // Convert result to context documents for further processing
    context = new Document({
      pageContent: result,
      metadata: { source: tool.name, tool_call: true },
    });
  } catch (error) {
    console.error("Error executing tool:", error);

    // Return error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorResult = `Error when executing tool: ${errorMessage}`;

    // Assign error docs to context
    context = new Document({
      pageContent: errorResult,
      metadata: { source: "error", tool_call: true },
    });
  } finally {
    const existingContext = state.context || [];
    const updatedContext = [...existingContext, context];
    console.log("Tool context : ", context);

    return { context: updatedContext };
  }
};

const generatorNode = async (state: typeof StateAnnotation.State) => {
  const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
  const messages = await gemmaPromptTemplate.invoke({
    question: state.question,
    context: docsContent,
  });
  // console.log("Messages:", messages);
  const response = await llm.invoke(messages);
  return { answer: response.content };
};

export const graph = new StateGraph(StateAnnotation)
  .addNode("retrieve", retrievalNode)
  .addNode("generate", generatorNode)
  .addNode("toolDecision", toolsDecisionNode)
  .addNode("tool", toolNode)
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "toolDecision")
  .addConditionalEdges("toolDecision", shouldUseTool, {
    tool: "tool",
    generate: "generate",
  })
  .addEdge("tool", "generate")
  .addEdge("generate", "__end__");

const checkpointer = new MemorySaver();
export const graphWithMemory = graph.compile({ checkpointer });

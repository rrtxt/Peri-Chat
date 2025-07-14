import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getRetriever } from "./retriever";
import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";
import { Document } from "langchain/document";
import { gemmaPromptTemplate } from "./prompt";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  model: "gemma-3-27b-it",
  temperature: 0.2,
  topK: 7,
});

type InputState = {
  question: string;
};

const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
});

const retrievalNode = async (state: InputState) => {
  const retrievedDocs = await getRetriever().invoke(state.question);

  // Transform the document content to include metadata
  const transformedDocs = retrievedDocs.map((doc) => {
    const name = doc.metadata["name"] ?? "Unknown TWS";
    const price = doc.metadata["Price Link Toped"] ?? "N/A";
    const sound = doc.metadata["Overall Sound"] ?? "N/A";
    const content = `Name: ${name} \nPrice: ${price}\nSound: ${sound}\nDesc: ${doc.pageContent}\n\n`;

    return new Document({
      pageContent: content,
      metadata: doc.metadata,
    });
  });

  return {
    context: transformedDocs,
  };
};

const generatorNode = async (state: typeof StateAnnotation.State) => {
  const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
  const messages = await gemmaPromptTemplate.invoke({
    question: state.question,
    context: docsContent,
  });
  console.log("Messages:", messages);
  const response = await llm.invoke(messages);
  return { answer: response.content };
};

export const graph = new StateGraph(StateAnnotation)
  .addNode("retrieve", retrievalNode)
  .addNode("generate", generatorNode)
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", "__end__");

const checkpointer = new MemorySaver();
export const graphWithMemory = graph.compile({ checkpointer });

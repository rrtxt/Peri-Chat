import { graph } from "../lib/rag/chain";

export async function runChat(question: string) {
  const result = await graph.invoke({
    question: question,
  });

  return {
    answer: result.answer || "Sorry, I couldn't find relevant information.",
    sources: result.context.map((doc) => doc.metadata) || [],
  };
}

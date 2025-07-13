"use server";
import { graph } from "../lib/rag/chain";

export async function runChat(question: string) {
  const result = await graph.invoke({
    question: question,
  });

  // return {
  //   answer:
  //     result.answer || "Sorry, I couldn't answer this question right now.",
  //   sources: result.context.map((doc) => doc.metadata) || [],
  // };
  console.log(result);
  return {
    role: "assistant" as const,
    message:
      result.answer || "Sorry, I couldn't answer this question right now.",
  };
}

"use server";

import { graph } from "@/lib/rag/chain";

export async function runChat(question: string) {
  const result = await graph.invoke({
    question: question,
  });

  console.log(result);
  return {
    role: "assistant" as const,
    message:
      result.answer || "Sorry, I couldn't answer this question right now.",
  };
}

export async function streamChat(question: string) {
  const result = await graph.stream({
    question: question,
  });

  const chunks = [];

  for await (const chunk of result) {
    console.log("Stream chunk:", chunk);
    chunks.push({
      role: "assistant" as const,
      message: chunk.text || chunk.content || chunk.message || "",
    });
  }

  return result;
}

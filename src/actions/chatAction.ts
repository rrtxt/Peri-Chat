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
  return graph.stream({
    question: question,
  });

  // const chunks = [];

  // for await (const chunk of result) {
  //   console.log(`${chunk.generate?.answer || " "}|`);
  //   const message = chunk.generate?.answer || "";
  //   chunks.push({
  //     role: "assistant" as const,
  //     message,
  //   });
  // }

  // return chunks;
}

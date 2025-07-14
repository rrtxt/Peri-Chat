"use server";

import { graphWithMemory } from "@/lib/rag/chain";

export async function runChat(question: string, thread_id: string | undefined) {
  const threadConfig = {
    configurable: { thread_id },
  };
  const result = await graphWithMemory.invoke(
    {
      question,
    },
    threadConfig
  );

  return {
    role: "assistant" as const,
    message:
      result.answer || "Sorry, I couldn't answer this question right now.",
  };
}

export async function streamChat(question: string) {
  return graphWithMemory.stream({
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

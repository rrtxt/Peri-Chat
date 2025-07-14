import { graph } from "@/lib/rag/chain";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const graphStream = await graph.stream({ question });

      for await (const chunk of graphStream) {
        const message = chunk.generate?.answer || "";
        console.log(`${JSON.stringify(chunk, null, 2)}|`);

        controller.enqueue(encoder.encode(message));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

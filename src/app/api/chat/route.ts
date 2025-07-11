import { graph } from "@/app/lib/rag/chain";
import { NextApiRequest, NextApiResponse } from "next";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { question } = req.body;

    const result = await graph.invoke({
      question: question,
    });
    const answer =
      result.answer || "Sorry, I couldn't find relevant information.";
    console.log("Retrieved context:", result.context);

    return res.status(200).json({
      answer,
      sources: result.context.map((doc) => doc.metadata) || [],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

"use client";
import { useState } from "react";
import { runChat } from "../actions/chatAction";

type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>();
  const [input, setInput] = useState<string>("");

  const handleAction = async () => {
    console.log("Input:", input);
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      message: input,
    };
    setMessages((prev) => [...(prev || []), userMessage]);

    const assistantMessage = await runChat(input);
    setMessages((prev) => [...(prev || []), assistantMessage]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="h-[75vh] w-[50%] border justify-center items-center flex flex-col p-4">
        {!messages ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Chat with Peri</h1>
            <p className="text-lg mb-8">Ask me anything about our products!</p>
          </div>
        ) : (
          <div className="flex-1 w-full overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 my-1 rounded ${
                  msg.role === "user"
                    ? "text-right bg-blue-100"
                    : "text-left bg-gray-100"
                }`}>
                <span className="text-sm text-gray-700">{msg.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-[50%] border p-4">
        <div className="flex justify-center items-center gap-1.5">
          <input
            type="text"
            className="w-full p-1"
            placeholder="Berikan promptmu disini."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAction()}
          />
          <div
            className="bg-blue-500 text-white px-4 py-2 cursor-pointer rounded"
            onClick={handleAction}>
            Send
          </div>
        </div>
      </div>
    </div>
  );
}

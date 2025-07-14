"use client";
import { runChat } from "@/actions/chatAction";
import { ChatMessage } from "@/components/ChatMessage";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { v4 as uuidv4 } from "uuid";

type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>();
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [threadId, setThreadId] = useState<string>("");

  const handleAction = async () => {
    console.log("Input:", input);
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      message: input,
    };

    setMessages((prev) => [...(prev || []), userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (threadId.trim() === "") {
        setThreadId(uuidv4());
      }
      const assistantMessage = await runChat(input, threadId);
      setMessages((prev) => [...(prev || []), assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            Peri-Chat
          </h1>
        </div>
      </header>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
        {/* Chat Messages Area */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl mb-6 flex flex-col overflow-hidden">
          {!messages ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="max-w-md">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Chat with Peri
                </h2>
                <p className="text-amber-100 text-lg leading-relaxed">
                  Ask me anything about our products! I&apos;m here to help you
                  find exactly what you need.
                </p>
                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-amber-900/30 text-amber-100 text-sm rounded-full border border-amber-700/30">
                    Product Info
                  </span>
                  <span className="px-3 py-1 bg-amber-900/30 text-amber-100 text-sm rounded-full border border-amber-700/30">
                    Support
                  </span>
                  <span className="px-3 py-1 bg-amber-900/30 text-amber-100 text-sm rounded-full border border-amber-700/30">
                    Recommendations
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}>
                  <ChatMessage chat={msg} />
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-amber-900/20 backdrop-blur-md rounded-2xl px-4 py-3 max-w-xs border border-amber-700/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}></div>
                      <div
                        className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}></div>
                      <span className="text-amber-100 text-sm ml-2">
                        Peri is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full bg-stone-800/50 backdrop-blur-md border border-amber-700/30 rounded-xl px-4 py-3 text-amber-100 placeholder-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200"
                placeholder="Berikan promptmu disini..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction()}
                disabled={isLoading}
              />
            </div>
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isLoading || !input.trim()
                  ? "bg-stone-700 text-stone-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-700 hover:to-orange-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              }`}
              onClick={handleAction}
              disabled={isLoading || !input.trim()}>
              <span className="hidden sm:inline">Send</span>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Icon icon="iconoir:send-solid" width="24" height="24" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(217, 119, 6, 0.5);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(217, 119, 6, 0.7);
        }
      `}</style>
    </div>
  );
}

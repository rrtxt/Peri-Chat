import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  chat: {
    role: "user" | "assistant";
    message: string;
  };
}

export function ChatMessage({ chat }: ChatMessageProps) {
  return (
    <div
      className={`flex items-end gap-3 max-w-[85%] ${
        chat.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${
          chat.role === "user"
            ? "bg-gradient-to-r from-stone-600 to-stone-700"
            : "bg-gradient-to-r from-amber-600 to-orange-500"
        }`}>
        {chat.role === "user" ? "U" : "P"}
      </div>

      {/* Message Bubble */}
      <div
        className={`px-4 py-3 rounded-2xl backdrop-blur-md border transition-all duration-200 ${
          chat.role === "user"
            ? "bg-stone-700/60 border-stone-600/50 text-stone-100 rounded-br-md"
            : "bg-amber-900/30 border-amber-700/30 text-amber-100 rounded-bl-md"
        }`}>
        <div className="text-sm leading-relaxed prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-semibold text-amber-200">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-amber-200">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="ml-2">{children}</li>,
              code: ({ children }) => (
                <code className="bg-stone-800/70 px-2 py-1 rounded text-amber-200 text-xs">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-stone-800/70 p-3 rounded-lg overflow-x-auto text-xs mb-2">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-amber-600 pl-4 italic opacity-90 mb-2">
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => (
                <h1 className="text-lg font-bold mb-2 text-amber-200">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold mb-2 text-amber-200">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-bold mb-1 text-amber-200">
                  {children}
                </h3>
              ),
            }}>
            {chat.message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

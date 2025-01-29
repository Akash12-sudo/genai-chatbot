"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "No response" }]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error fetching response" }]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6 flex flex-col space-y-4">
        {/* Chat Messages */}
        <div className="h-[500px] overflow-y-auto border-b p-4 space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`w-fit max-w-lg px-4 py-3 rounded-xl text-sm overflow-x-auto leading-relaxed 
                ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg text-sm"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="text-blue-800 px-1 py-0.5 rounded" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Field */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button className="px-4 py-2 text-sm" onClick={handleSend} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
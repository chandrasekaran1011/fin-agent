"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreamingText } from "@/components/agent/StreamingText";
import { SemanticSearchBadge } from "./SemanticSearchBadge";
import { cn } from "@/lib/utils/cn";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  suggestedQuestions?: string[];
  className?: string;
}

export function ChatInterface({
  messages,
  onSend,
  isLoading,
  suggestedQuestions,
  className,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-[var(--border-default)] bg-white overflow-hidden h-full",
        className
      )}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && suggestedQuestions && (
          <div className="text-center py-8">
            <Bot className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Ask me anything about your financial data
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-full bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-[var(--accent-primary)]" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[75%] rounded-xl px-4 py-3",
                msg.role === "user"
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-l-2 border-[var(--accent-primary)]"
              )}
            >
              {msg.isStreaming ? (
                <StreamingText text={msg.content} className="text-sm" />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {msg.sources.map((src) => (
                    <SemanticSearchBadge key={src} source={src} />
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-7 w-7 rounded-full bg-[var(--accent-light)] flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-[var(--accent-primary)]" />
            </div>
            <div className="rounded-xl bg-[var(--bg-secondary)] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--border-default)] p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your financial data..."
          disabled={isLoading}
          className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 disabled:opacity-50"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

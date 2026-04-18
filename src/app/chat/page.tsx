"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UpgradeModal from "@/components/UpgradeModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const FREE_LIMIT = 5;

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "$1")
    .replace(/^[\-\*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [tier, setTier] = useState("free");
  const [displayMode, setDisplayMode] = useState("simple");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/messages")
        .then((r) => r.json())
        .then((data) => {
          if (data.messages) {
            setMessages(
              data.messages.map((m: Message) => ({
                ...m,
                content: m.role === "assistant" ? stripMarkdown(m.content) : m.content,
              }))
            );
          }
        })
        .catch(() => {});

      fetch("/api/user")
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setMessageCount(data.user.todayMessageCount ?? 0);
            setTier(data.user.tier || "free");
            setDisplayMode(data.user.displayMode || "simple");
          }
        })
        .catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (res.status === 403 && data.error === "FREE_LIMIT_REACHED") {
        setShowUpgrade(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Failed to get response");

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: stripMarkdown(data.message),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (typeof data.freeMessagesRemaining === "number") {
        setMessageCount(FREE_LIMIT - data.freeMessagesRemaining);
      }
      if (data.tier) setTier(data.tier);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "I apologize, something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      console.error(err);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3E8]">
        <div className="text-[#524C44] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  const freeRemaining = Math.max(0, FREE_LIMIT - messageCount);

  return (
    <div className="flex flex-col h-screen bg-[#F8F3E8]">
      {/* Header */}
      <header className="shrink-0 border-b border-[#E4D7BC] px-6 py-4 flex items-center justify-between bg-[#F8F3E8]">
        <Link href="/dashboard" className="flex items-baseline gap-2">
          <svg viewBox="0 0 28 28" className="w-5 h-5 text-[#1A1613]" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="14" cy="14" r="13" />
            <circle cx="14" cy="14" r="8" />
            <circle cx="14" cy="14" r="3" />
          </svg>
          <span
            className="text-[16px] leading-none tracking-tight text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Jyotish Guru
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {tier === "free" && (
            <div className="text-[11px] text-[#524C44] tracking-wide">
              <span className="text-[#8B2E1F] font-medium">{freeRemaining}</span>
              {" "}free left
            </div>
          )}
          {tier !== "free" && (
            <span className="px-2 py-0.5 rounded-full bg-[#B5893C]/10 border border-[#B5893C]/40 text-[#8B2E1F] text-[10px] font-medium uppercase tracking-[0.18em]">
              {tier}
            </span>
          )}
          <button
            onClick={async () => {
              const newMode = displayMode === "simple" ? "technical" : "simple";
              setDisplayMode(newMode);
              await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayMode: newMode }),
              });
            }}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#E4D7BC] hover:border-[#1A1613] transition-all cursor-pointer"
          >
            <span className="text-[10px] text-[#524C44] tracking-wide">{displayMode === "simple" ? "Simple" : "Technical"}</span>
            <div className={`w-7 h-3.5 rounded-full relative transition-colors ${
              displayMode === "technical" ? "bg-[#1A1613]" : "bg-[#E4D7BC]"
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-[#F8F3E8] absolute top-0.5 transition-all"
                style={{ left: displayMode === "technical" ? "15px" : "2px" }} />
            </div>
          </button>
          <Link
            href="/dashboard"
            className="text-[12px] text-[#524C44] hover:text-[#1A1613] transition-colors tracking-wide"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-[#F5EFDF] border border-[#E4D7BC] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#8B2E1F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              <h2
                className="text-[28px] text-[#1A1613] mb-3 tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Welcome, {session?.user?.name || "Seeker"}
              </h2>
              <p className="text-[#524C44] text-[14px] leading-[1.6] max-w-md mx-auto mb-10">
                I am your personal Vedic astrologer. Ask me about your birth chart,
                planetary periods, career, relationships, or any aspect of life.
                No astrology background needed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto">
                {[
                  "What does my birth chart say about my career?",
                  "Tell me about my current life period",
                  "What are my key strengths?",
                  "What should I work on right now?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-left p-3.5 rounded-sm bg-[#F5EFDF] border border-[#E4D7BC] text-[#524C44] text-[13px] leading-[1.5] hover:border-[#1A1613] hover:text-[#1A1613] transition-all cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 ${
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                }`}
              >
                <p className="text-[14px] leading-[1.6] whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="typing-dot w-2 h-2 rounded-full" />
                  <span className="typing-dot w-2 h-2 rounded-full" />
                  <span className="typing-dot w-2 h-2 rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#E4D7BC] p-4 bg-[#F8F3E8]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-sm bg-[#F8F3E8] border border-[#E4D7BC] text-[#1A1613] placeholder-[#A59E91] focus:outline-none focus:border-[#1A1613] transition-colors text-[14px]"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 w-11 h-11 rounded-full bg-[#1A1613] text-[#F8F3E8] flex items-center justify-center transition-all hover:bg-[#2D2520] disabled:opacity-30 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m0 0l-4-4m4 4l-4 4" />
            </svg>
          </button>
        </form>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}

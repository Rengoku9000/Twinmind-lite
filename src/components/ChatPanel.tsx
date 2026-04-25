"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";

interface ChatPanelProps {
    messages: ChatMessage[];
    isStreaming: boolean;
    error: string | null;
    onSend: (message: string) => void;
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
            <div
                className={`max-w-[88%] px-3 py-2 rounded-xl text-sm leading-relaxed ${isUser
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700/50"
                    }`}
            >
                {isUser ? (
                    message.content
                ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{message.content || "▌"}</ReactMarkdown>
                    </div>
                )}
            </div>
            <span className="text-[10px] text-gray-600 font-mono">
                {new Date(message.timestamp).toLocaleTimeString()}
            </span>
        </div>
    );
}

export function ChatPanel({ messages, isStreaming, error, onSend }: ChatPanelProps) {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || isStreaming) return;
        setInput("");
        onSend(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 shrink-0">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-gray-100">Chat</span>
                {isStreaming && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-indigo-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> thinking…
                    </span>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-500">
                        <MessageSquare className="w-10 h-10 opacity-20" />
                        <p className="text-sm">Click a suggestion or type a question<br />to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((m) => <MessageBubble key={m.id} message={m} />)
                )}

                {error && (
                    <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 shrink-0">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about the meeting…"
                        rows={2}
                        className="flex-1 resize-none bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-gray-700 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className="self-end px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-1.5">Enter to send · Shift+Enter for newline</p>
            </div>
        </div>
    );
}

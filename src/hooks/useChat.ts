"use client";

import { useState, useCallback, useRef } from "react";
import { ChatMessage, TranscriptEntry, MeetingInsights } from "@/types";

interface UseChatOptions {
    apiKey: string;
    transcript: TranscriptEntry[];
    insights: MeetingInsights | null;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
}

export function useChat({ apiKey, transcript, insights, systemPrompt, temperature = 0.7, maxTokens = 1024 }: UseChatOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const fullTranscript = transcript.map((e) => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.text}`).join("\n");

    const send = useCallback(
        async (userMessage: string) => {
            if (!apiKey) {
                setError("Set your Groq API key in Settings.");
                return;
            }
            if (!userMessage.trim()) return;

            const userEntry: ChatMessage = {
                id: crypto.randomUUID(),
                role: "user",
                content: userMessage.trim(),
                timestamp: new Date().toISOString(),
            };

            const assistantId = crypto.randomUUID();
            const assistantEntry: ChatMessage = {
                id: assistantId,
                role: "assistant",
                content: "",
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userEntry, assistantEntry]);
            setIsStreaming(true);
            setError(null);

            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const history = messages.map((m) => ({ role: m.role, content: m.content }));

                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-groq-api-key": apiKey,
                    },
                    body: JSON.stringify({
                        message: userMessage.trim(),
                        transcript: fullTranscript,
                        insights,
                        history,
                        systemPrompt,
                        temperature,
                        maxTokens,
                    }),
                    signal: controller.signal,
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error ?? "Chat request failed");
                }

                const reader = res.body?.getReader();
                const decoder = new TextDecoder();
                if (!reader) throw new Error("No response body");

                let accumulated = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    accumulated += chunk;

                    // Update the assistant message in-place
                    setMessages((prev) =>
                        prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
                    );
                }
            } catch (err: unknown) {
                if ((err as { name?: string })?.name === "AbortError") return;
                const msg = err instanceof Error ? err.message : "Chat error";
                setError(msg);
                // Remove empty assistant bubble on error
                setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            } finally {
                setIsStreaming(false);
            }
        },
        [apiKey, messages, fullTranscript, insights, systemPrompt, temperature, maxTokens]
    );

    return { messages, isStreaming, error, send };
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SuggestionBatch, TranscriptEntry } from "@/types";

interface UseSuggestionsOptions {
    apiKey: string;
    transcript: TranscriptEntry[];
    autoRefreshMs?: number; // default 30000, 0 = disabled
    contextWindowTokens?: number;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
}

// Rough token count estimate (~4 chars per token)
function estimateTokens(text: string) {
    return Math.ceil(text.length / 4);
}

// Get recent transcript text within token budget
function getRecentContext(transcript: TranscriptEntry[], maxTokens: number): string {
    const lines = transcript.map((e) => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.text}`);
    let budget = maxTokens;
    const selected: string[] = [];

    for (let i = lines.length - 1; i >= 0; i--) {
        const tokens = estimateTokens(lines[i]);
        if (budget - tokens < 0) break;
        budget -= tokens;
        selected.unshift(lines[i]);
    }

    return selected.join("\n");
}

export function useSuggestions({
    apiKey,
    transcript,
    autoRefreshMs = 30000,
    contextWindowTokens = 2000,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 512,
}: UseSuggestionsOptions) {
    const [batches, setBatches] = useState<SuggestionBatch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const prevSuggestionsRef = useRef<string[]>([]);

    const refresh = useCallback(async () => {
        if (!apiKey) {
            setError("Set your Groq API key in Settings.");
            return;
        }
        if (transcript.length === 0) {
            setError("No transcript yet. Start recording first.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const recentContext = getRecentContext(transcript, contextWindowTokens);
        const previousSuggestions = prevSuggestionsRef.current;

        try {
            const res = await fetch("/api/suggestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-groq-api-key": apiKey,
                },
                body: JSON.stringify({
                    transcript: recentContext,
                    previousSuggestions,
                    systemPrompt,
                    temperature,
                    maxTokens,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Suggestions failed");

            const batch: SuggestionBatch = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                suggestions: data.suggestions,
            };

            setBatches((prev) => [batch, ...prev]);
            prevSuggestionsRef.current = [
                ...previousSuggestions,
                ...data.suggestions.map((s: { text: string }) => s.text),
            ].slice(-9); // keep last 3 batches worth
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to get suggestions");
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, transcript, contextWindowTokens, systemPrompt, temperature, maxTokens]);

    const transcriptRef = useRef(transcript);
    const apiKeyRef = useRef(apiKey);
    const refreshRef = useRef(refresh);

    useEffect(() => {
        transcriptRef.current = transcript;
        apiKeyRef.current = apiKey;
        refreshRef.current = refresh;
    }, [transcript, apiKey, refresh]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefreshMs || autoRefreshMs <= 0) return;
        const id = setInterval(() => {
            if (transcriptRef.current.length > 0 && apiKeyRef.current) refreshRef.current();
        }, autoRefreshMs);
        return () => clearInterval(id);
    }, [autoRefreshMs]);

    return { batches, isLoading, error, refresh };
}

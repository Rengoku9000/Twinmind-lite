"use client";

import { RefreshCw, Loader2, Zap } from "lucide-react";
import { SuggestionBatch, Suggestion } from "@/types";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
    question: { label: "Question", color: "bg-blue-500/20 text-blue-400 ring-blue-500/30" },
    answer: { label: "Answer", color: "bg-green-500/20 text-green-400 ring-green-500/30" },
    talking_point: { label: "Talking Point", color: "bg-purple-500/20 text-purple-400 ring-purple-500/30" },
    fact_check: { label: "Fact Check", color: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/30" },
    clarification: { label: "Clarification", color: "bg-orange-500/20 text-orange-400 ring-orange-500/30" },
};

function SuggestionCard({
    suggestion,
    onClick,
    faded,
}: {
    suggestion: Suggestion;
    onClick: () => void;
    faded?: boolean;
}) {
    const cfg = TYPE_CONFIG[suggestion.type] ?? { label: suggestion.type, color: "bg-gray-500/20 text-gray-400 ring-gray-500/30" };

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ease-in-out group ${faded
                ? "bg-gray-800/10 border-gray-800/30 hover:bg-gray-800/40 opacity-60 hover:opacity-100 hover:-translate-y-0.5"
                : "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-500/40 shadow-sm hover:shadow-md hover:-translate-y-[2px]"
                }`}
        >
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 mb-2 ${cfg.color}`}>
                {cfg.label}
            </span>
            <p className="text-sm text-gray-200 leading-snug group-hover:text-white transition-colors">
                {suggestion.preview || suggestion.text}
            </p>
        </button>
    );
}

function SkeletonCard() {
    return (
        <div className="w-full p-3 rounded-lg border border-gray-800 bg-gray-800/30 animate-pulse space-y-2">
            <div className="h-4 w-24 bg-gray-700 rounded-full" />
            <div className="h-3 w-full bg-gray-700/70 rounded" />
            <div className="h-3 w-3/4 bg-gray-700/50 rounded" />
        </div>
    );
}

interface SuggestionsPanelProps {
    batches: SuggestionBatch[];
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
    onSuggestionClick: (suggestion: Suggestion) => void;
}

export function SuggestionsPanel({ batches, isLoading, error, onRefresh, onSuggestionClick }: SuggestionsPanelProps) {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400/80" />
                    <span className="text-sm font-semibold text-gray-200">Actionable Suggestions</span>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 ring-1 ring-yellow-500/30 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Refresh
                </button>
            </div>

            {/* Suggestions list */}
            <div className="flex-1 p-4 space-y-5">
                {/* Loading skeleton for new batch */}
                {isLoading && (
                    <div className="space-y-2">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                {batches.length === 0 && !isLoading && !error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-500">
                        <Zap className="w-10 h-10 opacity-20" />
                        <p className="text-sm">Suggestions auto-generate every 30s.<br />Or click <strong>Refresh</strong> anytime.</p>
                    </div>
                ) : (
                    batches.map((batch, batchIndex) => (
                        <div key={batch.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-500">
                                    {new Date(batch.timestamp).toLocaleTimeString()}
                                </span>
                                {batchIndex === 0 && !isLoading && (
                                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">
                                        Latest
                                    </span>
                                )}
                            </div>
                            {batch.suggestions.map((s, i) => (
                                <SuggestionCard
                                    key={i}
                                    suggestion={s}
                                    onClick={() => onSuggestionClick(s)}
                                    faded={batchIndex > 0}
                                />
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

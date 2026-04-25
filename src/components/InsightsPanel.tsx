"use client";

import {
    RefreshCw,
    Loader2,
    Compass,
    HelpCircle,
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    Hash,
    Target,
} from "lucide-react";
import { MeetingInsights } from "@/types";

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
    exploration: { label: "Exploration", color: "bg-blue-500/20 text-blue-400 ring-blue-500/30" },
    discussion: { label: "Discussion", color: "bg-purple-500/20 text-purple-400 ring-purple-500/30" },
    decision: { label: "Decision", color: "bg-green-500/20 text-green-400 ring-green-500/30" },
};

function InsightSection({
    icon: Icon,
    title,
    items,
    color,
    emptyText,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    items: string[];
    color: string;
    emptyText: string;
}) {
    if (items.length === 0) {
        return (
            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
                </div>
                <p className="text-xs text-gray-600 italic pl-5">{emptyText}</p>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
                <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full font-mono">{items.length}</span>
            </div>
            <ul className="space-y-1 pl-5">
                {items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-200 leading-snug flex items-start gap-2">
                        <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${color.replace("text-", "bg-")}`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SkeletonInsights() {
    return (
        <div className="space-y-5 animate-pulse p-4">
            <div className="h-5 bg-gray-700/50 rounded w-3/4" />
            <div className="flex gap-2">
                <div className="h-5 bg-gray-700/40 rounded-full w-20" />
                <div className="h-5 bg-gray-700/40 rounded-full w-24" />
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-700/30 rounded w-28" />
                <div className="h-3 bg-gray-700/20 rounded w-full" />
                <div className="h-3 bg-gray-700/20 rounded w-4/5" />
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-700/30 rounded w-24" />
                <div className="h-3 bg-gray-700/20 rounded w-full" />
            </div>
        </div>
    );
}

interface InsightsPanelProps {
    insights: MeetingInsights | null;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}

export function InsightsPanel({ insights, isLoading, error, onRefresh }: InsightsPanelProps) {
    const stage = insights?.stage ? STAGE_CONFIG[insights.stage] ?? STAGE_CONFIG.exploration : null;

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400/80" />
                    <span className="text-sm font-semibold text-gray-200">Meeting Context</span>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 ring-1 ring-cyan-500/30 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Refresh
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading && !insights && <SkeletonInsights />}

                {error && (
                    <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                {!insights && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-500">
                        <Compass className="w-10 h-10 opacity-20" />
                        <p className="text-sm">
                            Insights auto-generate every 45s.<br />
                            Or click <strong>Refresh</strong> anytime.
                        </p>
                    </div>
                )}

                {insights && (
                    <div className="space-y-5">
                        {/* Primary Topic */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-400" />
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Topic</span>
                                {stage && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${stage.color}`}>
                                        {stage.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-200 mt-1">
                                {insights.topic || "No primary topic detected yet"}
                            </p>
                        </div>

                        {/* Secondary Topics */}
                        {insights.secondary_topics.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Related</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {insights.secondary_topics.map((topic, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700/50"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <hr className="border-gray-800" />

                        {/* Open Questions */}
                        <InsightSection
                            icon={HelpCircle}
                            title="Open Questions"
                            items={insights.open_questions}
                            color="text-amber-400"
                            emptyText="No unanswered questions"
                        />

                        {/* Decisions */}
                        <InsightSection
                            icon={CheckCircle2}
                            title="Decisions"
                            items={insights.decisions}
                            color="text-green-400"
                            emptyText="No decisions yet"
                        />

                        {/* Confusions */}
                        <InsightSection
                            icon={AlertTriangle}
                            title="Confusions"
                            items={insights.confusions}
                            color="text-red-400"
                            emptyText="Nothing unclear"
                        />

                        {/* Opportunities */}
                        <InsightSection
                            icon={Lightbulb}
                            title="Opportunities"
                            items={insights.opportunities}
                            color="text-yellow-400"
                            emptyText="No additional opportunities"
                        />

                        {/* Timestamp */}
                        {isLoading && (
                            <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Updating…
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

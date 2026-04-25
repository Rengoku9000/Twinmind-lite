"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { TranscriptEntry } from "@/types";

interface TranscriptPanelProps {
    entries: TranscriptEntry[];
    partialEntry?: string;
    isRecording: boolean;
    isTranscribing: boolean;
    onToggle: () => void;
}

export function TranscriptPanel({ entries, partialEntry, isRecording, isTranscribing, onToggle }: TranscriptPanelProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [entries, partialEntry]);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-100">Transcript</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                    </span>
                </div>
                <button
                    onClick={onToggle}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isRecording
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/50"
                        : "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 ring-1 ring-indigo-500/50"
                        }`}
                >
                    {isRecording ? (
                        <>
                            <MicOff className="w-3.5 h-3.5" />
                            Stop
                        </>
                    ) : (
                        <>
                            <Mic className="w-3.5 h-3.5" />
                            Start
                        </>
                    )}
                </button>
            </div>

            {/* Transcript list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {entries.length === 0 && !partialEntry ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-500">
                        <Mic className="w-10 h-10 opacity-20" />
                        <p className="text-sm">Click <strong>Start</strong> to begin recording.<br />Transcripts will appear live continuously.</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id} className="group">
                            <div className="text-[10px] text-gray-500 mb-1 font-mono">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="text-sm text-gray-200 leading-relaxed bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700/50">
                                {entry.text}
                            </div>
                        </div>
                    ))
                )}

                {/* Live Partial Preview */}
                {partialEntry && (
                    <div className="group opacity-70 italic text-gray-400">
                        <div className="text-[10px] text-gray-500 mb-1 font-mono flex items-center gap-2">
                            <span>Live...</span>
                        </div>
                        <div className="text-sm bg-gray-800/40 rounded-lg px-3 py-2 border border-gray-700/30 flex items-center gap-2">
                            <span>{partialEntry}</span>
                            <span className="flex space-x-0.5 ml-1">
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}

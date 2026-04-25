"use client";

import { Download } from "lucide-react";
import { TranscriptEntry, SuggestionBatch, ChatMessage } from "@/types";

interface ExportButtonProps {
    transcript: TranscriptEntry[];
    sugesstionBatches: SuggestionBatch[];
    chatMessages: ChatMessage[];
}

export function ExportButton({ transcript, sugesstionBatches, chatMessages }: ExportButtonProps) {
    const handleExport = () => {
        const data = {
            exportedAt: new Date().toISOString(),
            transcript,
            suggestions: sugesstionBatches,
            chat: chatMessages,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `twinmind-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-all"
        >
            <Download className="w-3.5 h-3.5" />
            Export JSON
        </button>
    );
}

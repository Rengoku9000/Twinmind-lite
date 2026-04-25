"use client";

import { useState, useCallback, useRef } from "react";
import { Brain } from "lucide-react";

import { TranscriptPanel } from "@/components/TranscriptPanel";
import { InsightsPanel } from "@/components/InsightsPanel";
import { SuggestionsPanel } from "@/components/SuggestionsPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { SettingsModal } from "@/components/SettingsModal";
import { ExportButton } from "@/components/ExportButton";

import { useMic } from "@/hooks/useMic";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useInsights } from "@/hooks/useInsights";
import { useChat } from "@/hooks/useChat";
import { useSettings } from "@/hooks/useSettings";

import { splitIntoSentences, removeOverlap, isFuzzyDuplicate } from "@/lib/transcript";

import { TranscriptEntry, Suggestion } from "@/types";

export default function Home() {
  const { settings, save } = useSettings();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [partialTranscript, setPartialTranscript] = useState("");
  const lastChunkTimestamp = useRef<number>(Date.now());
  const [errors, setErrors] = useState<string[]>([]);

  const addError = useCallback((msg: string) => {
    setErrors((e) => [...e.slice(-2), msg]);
    setTimeout(() => setErrors((e) => e.slice(1)), 5000);
  }, []);

  const handleNewChunk = useCallback((entry: TranscriptEntry) => {
    setPartialTranscript((prevPartial) => {
      let basePartial = prevPartial;

      if (entry.text.trim().length === 0) {
        if (basePartial.trim().length > 0) {
          setTranscript((t) => {
            // Prevent adding pure duplicate of the last finalized entry
            if (isFuzzyDuplicate(basePartial.trim(), t)) return t;

            return [
              ...t,
              { id: crypto.randomUUID(), timestamp: new Date().toISOString(), text: basePartial.trim() }
            ];
          });
        }
        return "";
      }

      const deduplicatedText = removeOverlap(basePartial, entry.text);

      let combined = "";
      if (/^[.,!?]/.test(deduplicatedText)) {
        combined = (basePartial + deduplicatedText).trim();
      } else {
        combined = (basePartial + " " + deduplicatedText).trim();
      }

      const sentences = splitIntoSentences(combined);

      if (sentences.length === 0) return combined;

      // Always hold the last sentence as partial to catch incoming Whisper overlaps
      const finals = sentences.slice(0, -1);
      let newPartial = sentences.slice(-1)[0] || "";

      if (newPartial.length > 120) {
        finals.push(newPartial);
        newPartial = "";
      }

      if (finals.length > 0) {
        setTranscript((t) => {
          let updatedT = [...t];

          for (const sentence of finals) {
            const isDuplicate = isFuzzyDuplicate(sentence, updatedT);
            if (!isDuplicate) {
              updatedT.push({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                text: sentence
              });
            }
          }

          return updatedT;
        });
      }

      return newPartial;
    });
  }, []);

  const { isRecording, isTranscribing, toggle } = useMic({
    apiKey: settings.apiKey,
    chunkDurationMs: 5000,
    onTranscript: handleNewChunk,
    onError: addError,
  });

  const { batches, isLoading: suggestionsLoading, error: suggestionsError, refresh } = useSuggestions({
    apiKey: settings.apiKey,
    transcript,
    autoRefreshMs: 30000,
    contextWindowTokens: settings.contextWindowTokens,
    systemPrompt: settings.suggestionPrompt,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
  });

  const { insights, isLoading: insightsLoading, error: insightsError, refresh: refreshInsights } = useInsights({
    apiKey: settings.apiKey,
    transcript,
    autoRefreshMs: 45000,
    contextWindowTokens: settings.contextWindowTokens,
    systemPrompt: settings.insightsPrompt,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
  });

  const { messages, isStreaming, error: chatError, send } = useChat({
    apiKey: settings.apiKey,
    transcript,
    insights,
    systemPrompt: settings.chatPrompt,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
  });

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      send(suggestion.text);
    },
    [send]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-gray-800 shrink-0 bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center ring-1 ring-indigo-500/30">
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-100 leading-none">TwinMind Lite</h1>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">AI Meeting Copilot</p>
          </div>
        </div>

        {/* Global error toasts */}
        <div className="flex-1 flex justify-center">
          {errors.length > 0 && (
            <div className="flex flex-col gap-1 max-w-md">
              {errors.map((e, i) => (
                <div key={i} className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-1.5">
                  {e}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            transcript={transcript}
            sugesstionBatches={batches}
            chatMessages={messages}
          />
          <SettingsModal settings={settings} onSave={save} />
        </div>
      </header>

      {/* 3-column layout */}
      <main className="flex-1 grid grid-cols-[1.1fr_1.4fr_1.1fr] gap-4 p-4 min-h-0">

        {/* Left Column: Transcript */}
        <div className="relative h-full overflow-hidden rounded-xl border border-gray-800 shadow-xl">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-[0.15] blur-sm pointer-events-none mix-blend-lighten"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            src="/Video/145030-785786165.mp4"
          />
          <div className="relative z-10 h-full overflow-y-hidden">
            <TranscriptPanel
              entries={transcript}
              partialEntry={partialTranscript}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onToggle={toggle}
            />
          </div>
        </div>

        {/* Middle Column: AI Panel */}
        <div className="relative h-full overflow-hidden rounded-xl border border-gray-800 shadow-xl">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none mix-blend-lighten"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            src="/Video/145030-785786165.mp4"
          />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex-[0.4] overflow-y-auto border-b border-white/10 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <InsightsPanel
                insights={insights}
                isLoading={insightsLoading}
                error={insightsError}
                onRefresh={refreshInsights}
              />
            </div>
            <div className="flex-[0.6] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <SuggestionsPanel
                batches={batches}
                isLoading={suggestionsLoading}
                error={suggestionsError}
                onRefresh={refresh}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="relative h-full overflow-hidden rounded-xl border border-gray-800 shadow-xl">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-[0.12] blur-sm pointer-events-none mix-blend-lighten"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            src="/Video/145030-785786165.mp4"
          />
          <div className="relative z-10 h-full overflow-y-hidden">
            <ChatPanel
              messages={messages}
              isStreaming={isStreaming}
              error={chatError}
              onSend={send}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

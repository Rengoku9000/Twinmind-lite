"use client";

import { useState } from "react";
import { Settings as SettingsIcon, X, Eye, EyeOff } from "lucide-react";
import { Settings, DEFAULT_SETTINGS } from "@/types";

interface SettingsModalProps {
    settings: Settings;
    onSave: (updates: Partial<Settings>) => void;
}

type Tab = "key" | "advanced";

export function SettingsModal({ settings, onSave }: SettingsModalProps) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("key");
    const [draft, setDraft] = useState<Settings>(settings);
    const [showKey, setShowKey] = useState(false);

    const handleOpen = () => {
        setDraft(settings);
        setTab("key");
        setOpen(true);
    };

    const inputClass =
        "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600";
    const textareaClass = `${inputClass} resize-none font-mono text-xs`;

    return (
        <>
            <button
                onClick={handleOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-all"
            >
                <SettingsIcon className="w-3.5 h-3.5" />
                Settings
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
                    <div
                        className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl"
                        style={{ display: "flex", flexDirection: "column", maxHeight: "80vh" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800" style={{ flexShrink: 0 }}>
                            <h2 className="text-sm font-bold text-gray-100">Settings</h2>
                            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-800" style={{ flexShrink: 0 }}>
                            <button
                                onClick={() => setTab("key")}
                                className={`px-5 py-2.5 text-xs font-semibold transition-colors ${tab === "key" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                🔑 API Key
                            </button>
                            <button
                                onClick={() => setTab("advanced")}
                                className={`px-5 py-2.5 text-xs font-semibold transition-colors ${tab === "advanced" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                ⚙️ Advanced
                            </button>
                        </div>

                        {/* Body — scrollable */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px", minHeight: 0 }}>

                            {/* ── API KEY TAB (only 1 field) ── */}
                            {tab === "key" && (
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#d1d5db", marginBottom: 8 }}>
                                        Groq API Key
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={showKey ? "text" : "password"}
                                            value={draft.apiKey}
                                            onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
                                            placeholder="gsk_..."
                                            autoComplete="off"
                                            style={{
                                                width: "100%",
                                                background: "#1f2937",
                                                border: "1px solid #374151",
                                                borderRadius: 8,
                                                padding: "10px 40px 10px 12px",
                                                fontSize: 14,
                                                color: "#f9fafb",
                                                outline: "none",
                                                boxSizing: "border-box",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowKey((v) => !v)}
                                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
                                        >
                                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>
                                        Get your key at{" "}
                                        <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: "#818cf8", textDecoration: "underline" }}>
                                            console.groq.com/keys
                                        </a>
                                        . Stored only in your browser — never sent anywhere except Groq.
                                    </p>
                                </div>
                            )}

                            {/* ── ADVANCED TAB ── */}
                            {tab === "advanced" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    {/* Temperature */}
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>
                                            Temperature: <span style={{ color: "#818cf8" }}>{draft.temperature}</span>
                                        </label>
                                        <input
                                            type="range" min={0} max={2} step={0.1}
                                            value={draft.temperature}
                                            onChange={(e) => setDraft((d) => ({ ...d, temperature: Number(e.target.value) }))}
                                            style={{ width: "100%", accentColor: "#6366f1" }}
                                        />
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4b5563", marginTop: 2 }}>
                                            <span>Precise</span><span>Creative</span>
                                        </div>
                                    </div>
                                    {/* Context window */}
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Context Window (tokens)</label>
                                        <input type="number" min={100} max={8000} value={draft.contextWindowTokens}
                                            onChange={(e) => setDraft((d) => ({ ...d, contextWindowTokens: Number(e.target.value) }))}
                                            className={inputClass} />
                                    </div>
                                    {/* Max tokens */}
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Max Output Tokens</label>
                                        <input type="number" min={64} max={4096} value={draft.maxTokens}
                                            onChange={(e) => setDraft((d) => ({ ...d, maxTokens: Number(e.target.value) }))}
                                            className={inputClass} />
                                    </div>
                                    {/* Suggestion prompt */}
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Suggestion System Prompt</label>
                                        <textarea rows={8} value={draft.suggestionPrompt}
                                            onChange={(e) => setDraft((d) => ({ ...d, suggestionPrompt: e.target.value }))}
                                            className={textareaClass} />
                                    </div>
                                    {/* Chat prompt */}
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Chat System Prompt</label>
                                        <textarea rows={6} value={draft.chatPrompt}
                                            onChange={(e) => setDraft((d) => ({ ...d, chatPrompt: e.target.value }))}
                                            className={textareaClass} />
                                    </div>
                                    {/* Insights prompt */}
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Insights System Prompt</label>
                                        <textarea rows={8} value={draft.insightsPrompt}
                                            onChange={(e) => setDraft((d) => ({ ...d, insightsPrompt: e.target.value }))}
                                            className={textareaClass} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid #1f2937", flexShrink: 0 }}
                        >
                            <button
                                onClick={() => setDraft(DEFAULT_SETTINGS)}
                                style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
                            >
                                Reset to defaults
                            </button>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2 text-xs rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { onSave(draft); setOpen(false); }}
                                    className="px-4 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

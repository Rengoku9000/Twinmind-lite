"use client";

import { useState, useRef, useCallback } from "react";
import { TranscriptEntry } from "@/types";

interface UseMicOptions {
    apiKey: string;
    chunkDurationMs?: number; // default 30000
    onTranscript?: (entry: TranscriptEntry) => void;
    onError?: (err: string) => void;
}

export function useMic({ apiKey, chunkDurationMs = 30000, onTranscript, onError }: UseMicOptions) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const systemStreamRef = useRef<MediaStream | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const flushLocalChunks = useCallback(
        async (localChunks: Blob[], mimeType: string) => {
            if (localChunks.length === 0) return;

            const blob = new Blob(localChunks, { type: mimeType });
            if (blob.size < 1000) return; // skip near-empty blobs

            setIsTranscribing(true);
            try {
                const form = new FormData();
                form.append("audio", blob, "audio.webm");

                const res = await fetch("/api/transcribe", {
                    method: "POST",
                    headers: { "x-groq-api-key": apiKey },
                    body: form,
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message ?? data.error ?? "Transcription failed");

                if (data.text?.trim()) {
                    const entry: TranscriptEntry = {
                        id: crypto.randomUUID(),
                        timestamp: new Date().toISOString(),
                        text: data.text.trim(),
                    };
                    onTranscript?.(entry);
                }
            } catch (err: unknown) {
                onError?.(err instanceof Error ? err.message : "Transcription error");
            } finally {
                setIsTranscribing(false);
            }
        },
        [apiKey, onTranscript, onError]
    );

    const startNewChunk = useCallback(() => {
        // 1. Stop current recorder — this triggers its ondataavailable and onstop
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }

        // 2. Start a new recorder right away for the next chunk
        if (!streamRef.current) return;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm";

        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        const localChunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) localChunks.push(e.data);
        };

        recorder.onstop = () => {
            flushLocalChunks(localChunks, mimeType);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
    }, [flushLocalChunks]);

    const start = useCallback(async () => {
        if (isRecording) return;
        if (!apiKey) {
            onError?.("Please set your Groq API key in Settings.");
            return;
        }

        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = micStream;

            const systemStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
            systemStreamRef.current = systemStream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            const micSource = audioContext.createMediaStreamSource(micStream);
            const systemSource = audioContext.createMediaStreamSource(systemStream);

            const destination = audioContext.createMediaStreamDestination();
            micSource.connect(destination);
            systemSource.connect(destination);

            streamRef.current = destination.stream;

            // Start the first chunk immediately
            startNewChunk();
            setIsRecording(true);

            // Rotate recorders every chunkDurationMs
            intervalRef.current = setInterval(() => {
                startNewChunk();
            }, chunkDurationMs);

        } catch (err: unknown) {
            onError?.(err instanceof Error ? err.message : "Microphone or Screen access denied");
        }
    }, [isRecording, apiKey, chunkDurationMs, startNewChunk, onError]);

    const stop = useCallback(() => {
        if (!isRecording) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Stop the final recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }

        // Stop mic tracks
        micStreamRef.current?.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;

        // Stop system tracks
        systemStreamRef.current?.getTracks().forEach((t) => t.stop());
        systemStreamRef.current = null;

        streamRef.current = null;

        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        setIsRecording(false);
    }, [isRecording]);

    const toggle = useCallback(() => {
        if (isRecording) stop();
        else start();
    }, [isRecording, start, stop]);

    return { isRecording, isTranscribing, toggle, start, stop };
}

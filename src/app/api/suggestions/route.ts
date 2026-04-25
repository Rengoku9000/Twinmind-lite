import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const DEFAULT_PROMPT = `You are a real-time meeting assistant.

Based on the transcript below, generate EXACTLY 3 useful suggestions.

Rules:
- Each suggestion must be concise (1–2 lines)
- Each must be a different type if possible (question, answer, talking_point, fact_check, clarification)
- Focus on the most recent discussion
- Avoid repeating previous ideas
- Be directly useful in a live conversation

Return ONLY a raw JSON array (no markdown, no code fences):
[
  {
    "type": "question|answer|talking_point|fact_check|clarification",
    "text": "Full suggestion text",
    "preview": "1–2 line preview"
  }
]`;

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get("x-groq-api-key");
    if (!apiKey) {
        return NextResponse.json({ error: "Missing Groq API key" }, { status: 401 });
    }

    const groq = new Groq({ apiKey });

    try {
        const body = await req.json();
        const { transcript, previousSuggestions = [], systemPrompt = DEFAULT_PROMPT, temperature = 0.7, maxTokens = 512 } = body;

        if (!transcript || transcript.trim().length === 0) {
            return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });
        }

        const previousContext = previousSuggestions.length
            ? `\n\nPrevious suggestions (avoid repeating):\n${previousSuggestions.join("\n")}`
            : "";

        const userContent = `TRANSCRIPT:\n${transcript}${previousContext}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
            temperature,
            max_tokens: maxTokens,
        });

        const raw = completion.choices[0]?.message?.content ?? "[]";

        // Strip any markdown code fences if model ignores instructions
        const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

        let suggestions;
        try {
            suggestions = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({ error: "Model returned invalid JSON", raw }, { status: 502 });
        }

        return NextResponse.json({ suggestions });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Suggestions failed";
        console.error("[suggestions]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const DEFAULT_PROMPT = `You are a real-time meeting intelligence engine.

Analyze the transcript and extract structured insights.

Focus on the MOST RECENT conversation, but include important ongoing threads.

Return JSON:

{
  "topic": "primary topic (1 line)",
  "secondary_topics": [],
  "stage": "exploration | discussion | decision",
  "open_questions": [],
  "decisions": [],
  "confusions": [],
  "opportunities": []
}

RULES:
- Be concise and specific
- Do NOT hallucinate
- Prioritize unresolved and actionable items
- Avoid repeating previous insights
- Capture what matters NOW, not everything

DEFINITIONS:
- open_questions: asked but not answered
- decisions: being made or finalized
- confusions: ambiguity, disagreement, lack of clarity
- opportunities: improvements, optimizations, risks, ideas

Output ONLY valid JSON.`;

const EMPTY_INSIGHTS = {
    topic: "",
    secondary_topics: [],
    stage: "exploration",
    open_questions: [],
    decisions: [],
    confusions: [],
    opportunities: [],
};

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get("x-groq-api-key");
    if (!apiKey) {
        return NextResponse.json({ error: "Missing Groq API key" }, { status: 401 });
    }

    const groq = new Groq({ apiKey });

    try {
        const body = await req.json();
        const {
            transcript,
            previousInsights,
            systemPrompt = DEFAULT_PROMPT,
            temperature = 0.4,
            maxTokens = 1024,
        } = body;

        if (!transcript || transcript.trim().length === 0) {
            return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });
        }

        let previousContext = "";
        if (previousInsights?.topic) {
            previousContext = `\n\nPrevious insights (avoid repeating):\nTopic: ${previousInsights.topic}\nDecisions: ${(previousInsights.decisions ?? []).join("; ")}`;
        }

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

        const raw = completion.choices[0]?.message?.content ?? "{}";
        const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

        let insights;
        try {
            insights = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({ error: "Model returned invalid JSON", raw }, { status: 502 });
        }

        // Merge with defaults to guarantee shape
        insights = { ...EMPTY_INSIGHTS, ...insights };

        return NextResponse.json({ insights });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Insights extraction failed";
        console.error("[insights]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

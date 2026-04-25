import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const DEFAULT_SYSTEM_PROMPT = `You are an expert assistant in a live meeting.

You are given:
- Full transcript
- Structured meeting insights
- A user query (from a suggestion)

Your job:
Deliver a HIGH-VALUE response that helps immediately.

Structure:
1. Direct Answer
2. **Key Insight** (based on conversation)
3. **Tradeoffs / Considerations**
4. **Clear Recommendation** (if applicable)

Use formatting to make the response organized:
- Use markdown bolding (**) for emphasis
- Use bullet points ('-') or numbered lists when bringing up multiple points
- Try to make each section as short as possible - a single sentence or bullet point if you can

Use insights to:
- Stay aligned with current topic
- Avoid irrelevant details
- Focus on decisions and open questions

CRITICAL: Be concise, practical, and sharp. Avoid wall of text and long paragraphs at all costs.`;

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get("x-groq-api-key");
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Missing Groq API key" }), { status: 401 });
    }

    const groq = new Groq({ apiKey });

    try {
        const body = await req.json();
        const {
            message,
            transcript = "",
            insights = null,
            history = [],
            systemPrompt = DEFAULT_SYSTEM_PROMPT,
            temperature = 0.7,
            maxTokens = 1024,
        } = body;

        let systemContent = systemPrompt;

        if (transcript.trim()) {
            systemContent += `\n\n--- MEETING TRANSCRIPT ---\n${transcript}`;
        }

        if (insights) {
            systemContent += `\n\n--- CURRENT MEETING INSIGHTS ---\n${JSON.stringify(insights, null, 2)}`;
        }

        // Build the message array: system + history + new user message
        const messages: Groq.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: systemContent },
            ...history.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
            { role: "user", content: message },
        ];

        const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: true,
        });

        // Stream the response as plain text (SSE-compatible)
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content ?? "";
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Content-Type-Options": "nosniff",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Chat failed";
        console.error("[chat]", message);
        return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
}

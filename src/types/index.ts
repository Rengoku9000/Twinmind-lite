// Shared TypeScript types for TwinMind Lite

export interface TranscriptEntry {
    id: string;
    timestamp: string; // ISO 8601
    text: string;
}

export type SuggestionType =
    | "question"
    | "answer"
    | "talking_point"
    | "fact_check"
    | "clarification";

export interface Suggestion {
    type: SuggestionType;
    text: string;
    preview: string;
}

export interface SuggestionBatch {
    id: string;
    timestamp: string;
    suggestions: Suggestion[];
}

export type InsightStage = "exploration" | "discussion" | "decision";

export interface MeetingInsights {
    topic: string;
    secondary_topics: string[];
    stage: InsightStage;
    open_questions: string[];
    decisions: string[];
    confusions: string[];
    opportunities: string[];
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface Settings {
    apiKey: string;
    suggestionPrompt: string;
    chatPrompt: string;
    insightsPrompt: string;
    contextWindowTokens: number;
    temperature: number;
    maxTokens: number;
}

export const DEFAULT_SETTINGS: Settings = {
    apiKey: "",
    suggestionPrompt: `You are a real-time meeting assistant.

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
]`,
    chatPrompt: `You are an expert assistant in a live meeting.

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

CRITICAL: Be concise, practical, and sharp. Avoid wall of text and long paragraphs at all costs.`,
    insightsPrompt: `You are a real-time meeting intelligence engine.

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

Output ONLY valid JSON.`,
    contextWindowTokens: 2000,
    temperature: 0.7,
    maxTokens: 1024,
};

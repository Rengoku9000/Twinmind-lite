export function splitIntoSentences(text: string): string[] {
    const matches = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [];
    return matches.map((s) => s.trim()).filter(Boolean);
}

// Basic overlap removal (finds suffix of A that perfectly matches prefix of B)
export function removeOverlap(previous: string, next: string): string {
    const maxOverlap = Math.min(previous.length, next.length);
    for (let i = maxOverlap; i > 0; i--) {
        const suffix = previous.slice(-i).toLowerCase();
        const prefix = next.slice(0, i).toLowerCase();
        if (suffix === prefix) {
            return next.slice(i).trim();
        }
    }
    return next.trim();
}

// Global + Fuzzy deduplication to avoid adding functionally repeated sentences
export function isFuzzyDuplicate(sentence: string, history: { text: string }[]): boolean {
    if (!sentence || history.length === 0) return false;

    // Normalize: lowercase, strip punctuation and extra whitespace
    const normalize = (str: string) => str.toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();

    const normalizedNew = normalize(sentence);

    // Only check the last 15 items to save time, Whisper doesn't hallucinate that deeply
    const recent = history.slice(-15);

    for (const past of recent) {
        const normalizedPast = normalize(past.text);
        if (normalizedPast === normalizedNew) return true;

        // Also check if the new sentence is already fully contained within a recent past sentence
        // (Whisper sometimes spits out fragments of the same long sentence repeatedly)
        if (normalizedNew.length > 5 && normalizedPast.includes(normalizedNew)) return true;
        if (normalizedPast.length > 5 && normalizedNew.includes(normalizedPast)) return true;
    }

    return false;
}

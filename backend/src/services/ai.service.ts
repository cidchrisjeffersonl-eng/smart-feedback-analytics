// Uses a local Ollama instance (https://ollama.com) — free, no API key, runs on your machine.
// Falls back gracefully to null if Ollama isn't running, so the rule-based engine takes over.

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

export interface AISuggestionInput {
  facultyName: string;
  avgRating: number | null;
  totalFeedback: number;
  negativeCount: number;
  topNegativeThemes: string[];
  sampleNegativeComments: string[];
}

export async function generateAISuggestion(
  input: AISuggestionInput,
): Promise<string | null> {
  try {
    const prompt = `You are an academic affairs advisor helping a department head respond to concerning student feedback trends for a faculty member.

Faculty: ${input.facultyName}
Average rating: ${input.avgRating ?? "N/A"} / 5
Total feedback count: ${input.totalFeedback}
Negative feedback count: ${input.negativeCount}
Recurring negative themes: ${input.topNegativeThemes.join(", ") || "none detected"}

Sample negative comments:
${input.sampleNegativeComments.map((c) => `- "${c}"`).join("\n") || "(no comments provided)"}

Write a short, specific, actionable intervention plan (3-4 sentences max) for the academic lead to discuss with this faculty member. Be constructive and professional, not punitive. Do not repeat the raw data back; synthesize it into concrete next steps. Respond with only the plan text, no preamble.`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.error(
        "Ollama request failed:",
        response.status,
        await response.text(),
      );
      return null;
    }

    const json = await response.json();
    if (
      typeof json === "object" &&
      json !== null &&
      "response" in json &&
      typeof (json as any).response === "string"
    ) {
      return ((json as any).response).trim();
    }
    return null;
  } catch (err) {
    console.error(
      "AI suggestion generation failed (falling back to rules):",
      err,
    );
    return null;
  }
}


import Sentiment from "sentiment";

const sentiment = new Sentiment();

// Simple keyword-based theme buckets — extend/replace with a trained model later.
const THEME_KEYWORDS: Record<string, string[]> = {
  "Teaching Clarity": ["clear", "understand", "explain", "confusing", "unclear"],
  "Punctuality": ["late", "early", "on time", "absent", "tardy"],
  "Engagement": ["engaging", "boring", "interactive", "interesting", "dull"],
  "Fairness": ["fair", "unfair", "biased", "grading", "grades"],
  "Communication": ["responsive", "approachable", "rude", "helpful", "communicate"],
};

export interface AnalysisResult {
  label: "positive" | "neutral" | "negative";
  score: number;
  themes: string[];
}

export function analyzeFeedback(text: string): AnalysisResult {
  if (!text || text.trim().length === 0) {
    return { label: "neutral", score: 0, themes: [] };
  }

  const result = sentiment.analyze(text);
  const normalizedScore = Math.max(-1, Math.min(1, result.comparative));

  let label: AnalysisResult["label"] = "neutral";
  if (normalizedScore > 0.05) label = "positive";
  else if (normalizedScore < -0.05) label = "negative";

  const lowerText = text.toLowerCase();
  const themes: string[] = [];
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      themes.push(theme);
    }
  }

  return { label, score: Number(normalizedScore.toFixed(2)), themes };
}

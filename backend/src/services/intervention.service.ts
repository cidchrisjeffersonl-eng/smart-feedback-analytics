// Rule-based intervention recommendation engine.
// Maps recurring negative themes to concrete, actionable suggestions.

const THEME_ACTIONS: Record<string, string> = {
  "Teaching Clarity":
    "Recommend a teaching methods workshop and peer mentoring focused on lecture clarity and pacing.",
  Punctuality:
    "Discuss attendance/punctuality expectations with the faculty member and review their class schedule for conflicts.",
  Engagement:
    "Suggest incorporating more interactive or activity-based teaching methods to improve student engagement.",
  Fairness:
    "Review grading rubrics with the faculty member and ensure grading criteria are clearly communicated to students.",
  Communication:
    "Encourage more accessible office hours and clearer channels for student communication.",
};

const DEFAULT_ACTION =
  "Schedule a one-on-one meeting with the faculty member to discuss recent feedback trends and identify support needed.";

export interface InterventionCheckResult {
  shouldFlag: boolean;
  reason: string;
  suggestedAction: string;
}

interface FacultyStats {
  avgRating: number | null;
  totalFeedback: number;
  negativeCount: number;
  topNegativeThemes: string[];
}

const MIN_FEEDBACK_FOR_FLAG = 3;
const RATING_THRESHOLD = 3.0;
const NEGATIVE_RATIO_THRESHOLD = 0.4;

export function evaluateForIntervention(
  stats: FacultyStats,
): InterventionCheckResult {
  if (stats.totalFeedback < MIN_FEEDBACK_FOR_FLAG) {
    return { shouldFlag: false, reason: "", suggestedAction: "" };
  }

  const negativeRatio = stats.negativeCount / stats.totalFeedback;
  const ratingLow =
    stats.avgRating !== null && stats.avgRating < RATING_THRESHOLD;
  const negativeHigh = negativeRatio >= NEGATIVE_RATIO_THRESHOLD;

  if (!ratingLow && !negativeHigh) {
    return { shouldFlag: false, reason: "", suggestedAction: "" };
  }

  const reasons: string[] = [];
  if (ratingLow)
    reasons.push(
      `Average rating (${stats.avgRating}) is below the ${RATING_THRESHOLD} threshold`,
    );
  if (negativeHigh)
    reasons.push(
      `${Math.round(negativeRatio * 100)}% of recent feedback is negative`,
    );

  const actions = stats.topNegativeThemes
    .map((theme) => THEME_ACTIONS[theme])
    .filter(Boolean);

  const suggestedAction =
    actions.length > 0 ? actions.slice(0, 2).join(" ") : DEFAULT_ACTION;

  return {
    shouldFlag: true,
    reason: reasons.join("; "),
    suggestedAction,
  };
}

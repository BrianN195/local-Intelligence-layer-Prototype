export default function analyzeRuleAdaptation(run, emergentBehavior) {
  if (!emergentBehavior?.detected) {
    return {
      adapted: false,
      action: "none",
      reason: "No emergent behavior detected.",
    };
  }

  // ====================================================
  // GLOBAL CONSENSUS

  if (emergentBehavior.type === "global_consensus") {
    return {
      adapted: false,
      action: "none",
      reason:
        "Global consensus detected. No rule adaptation required.",
    };
  }

  // ====================================================
  // LOCALIZED DIVERGENCE

  if (
    emergentBehavior.type ===
    "localized_divergence"
  ) {
    return {
      adapted: false,
      action: "review",
      reason:
        "Different neighborhoods developed distinct dominant states.",
      recommendation:
        "Consider neighborhood-specific rule adaptation.",
    };
  }

  // ====================================================
  // UNKNOWN PATTERN

  return {
    adapted: false,
    action: "review",
    reason:
      "Emergent behavior detected but no adaptation strategy exists.",
  };
}
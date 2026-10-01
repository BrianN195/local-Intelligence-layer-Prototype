export const DATA_LIFECYCLE_POLICY = {
  test: {
    retentionDays: 7,
    action: "delete",
    description:
      "Test experiment data is temporary and should be deleted after the retention period.",
  },

  rehearsal: {
    retentionDays: 30,
    action: "delete_raw_keep_summary",
    description:
      "Rehearsal raw data is temporary. Important summaries may be retained.",
  },

  research: {
    retentionDays: 3650,
    action: "archive",
    description:
      "Research experiment data should be retained for long-term analysis and archived when inactive.",
  },

  production: {
    retentionDays: null,
    action: "retain",
    description:
      "Production operational data is retained according to operational and commercial requirements.",
  },
};
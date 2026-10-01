import mongoose from "mongoose";

const CollectiveBehaviorResultSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    score: { type: Number, min: 0, max: 1, default: 0 },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: Date.now },
    summary: { type: String, default: "" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

CollectiveBehaviorResultSchema.index({ experimentRunId: 1, endTime: -1 });

export const CollectiveBehaviorResult = mongoose.model(
  "CollectiveBehaviorResult",
  CollectiveBehaviorResultSchema,
);

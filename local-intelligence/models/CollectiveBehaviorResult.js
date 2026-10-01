import mongoose from "mongoose";

const CollectiveBehaviorResultSchema = new mongoose.Schema({
  experimentRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExperimentRun",
  },
  type: {
    type: String,
    enum: ["sync", "clustering", "wave", "consensus"],
  },
  score: { type: Number, min: 0, max: 1 },
  confidence: { type: Number, min: 0, max: 1 },
  startTime: Date,
  endTime: Date,
  summary: String,
});

export const CollectiveBehaviorResult = mongoose.model(
  "CollectiveBehaviorResult",
  CollectiveBehaviorResultSchema,
);

import mongoose from "mongoose";

export const RuleSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    id: { type: String, required: true },
    type: { type: String, required: true, trim: true },
    scope: {
      type: String,
      enum: ["global", "agent", "neighborhood"],
      default: "global",
      required: true,
    },
    agentId: {
      type: String,
      ref: "Agent",
      default: null,
    },
    neighborhoodId: {
      type: String,
      ref: "Neighborhood",
      default: null,
    },
    signalType: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    threshold: { type: Number, min: 0, max: 1, default: null },
    minimumActiveNeighbors: { type: Number, min: 0, default: null },
    trigger: { type: mongoose.Schema.Types.Mixed, default: null },
    appendedSignal: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: true },
);

RuleSchema.index({ scope: 1, signalType: 1, enabled: 1 });

export const Rule = mongoose.model("Rule", RuleSchema);

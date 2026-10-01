import mongoose from "mongoose";
import { RuleSchema } from "./Rule.js";

const RuleSetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },
    rules: { type: [RuleSchema], default: [] },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    version: {
      type: String,
      default: "v1",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

RuleSetSchema.index({
  experimentRunId: 1,
  active: 1,
});
RuleSetSchema.index(
  { experimentRunId: 1 },
  { unique: true, partialFilterExpression: { active: true } },
);

export const RuleSet = mongoose.model("RuleSet", RuleSetSchema);

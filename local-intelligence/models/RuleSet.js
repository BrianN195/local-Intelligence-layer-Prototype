import mongoose from "mongoose";

const RuleSetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    experimentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },
    ruleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rule",
      },
    ],
    active: {
      type: Boolean,
      default: false,
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

export const RuleSet = mongoose.model("RuleSet", RuleSetSchema);

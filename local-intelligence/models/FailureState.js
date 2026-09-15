import mongoose from "mongoose";

const FailureStateSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    code: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    stack: {
      type: String,
      default: null,
    },

    recoverable: {
      type: Boolean,
      default: false,
    },

    resolved: {
      type: Boolean,
      default: false,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

FailureStateSchema.index({
  experimentRunId: 1,
  timestamp: -1,
});

export const FailureState = mongoose.model("FailureState", FailureStateSchema);

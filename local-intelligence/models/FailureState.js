import mongoose from "mongoose";

const FailureStateSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      default: null,
      index: true,
    },

    agentId: {
      type: String,
      ref: "Agent",
      default: null,
    },

    type: {
      type: String,
      default: "failure",
    },

    code: {
      type: String,
      default: "UNSPECIFIED_FAILURE",
      index: true,
    },

    message: {
      type: String,
      default: "",
    },

    reason: {
      type: String,
      default: "",
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
      index: true,
    },

    status: {
      type: String,
      enum: ["detected", "recovering", "resolved", "unresolved"],
      default: "detected",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

import mongoose from "mongoose";

const AgentStateHistorySchema = new mongoose.Schema(
  {
    agentId: {
      type: String,
      ref: "Agent",
      required: true,
      index: true,
    },

    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },

    signalId: {
      type: String,
      ref: "Signal",
      default: null,
    },

    triggeredRules: [
      {
        type: String,
        ref: "Rule",
      },
    ],

    previousState: {
      type: Number,
      default: null,
    },

    newState: {
      type: Number,
      required: true,
    },

    changed: {
      type: Boolean,
      default: true,
    },

    swarmStateChanged: {
      type: Boolean,
      default: null,
    },

    reason: {
      type: String,
      default: null,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

AgentStateHistorySchema.index({
  agentId: 1,
  timestamp: -1,
});

export const AgentStateHistory = mongoose.model(
  "AgentStateHistory",
  AgentStateHistorySchema,
);

import mongoose from "mongoose";

const AgentStateHistorySchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    experimentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
      index: true,
    },

    previousState: {
      type: String,
      default: null,
    },

    newState: {
      type: String,
      required: true,
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

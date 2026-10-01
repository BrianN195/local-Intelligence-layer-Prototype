import mongoose from "mongoose";

const AgentStateSchema = new mongoose.Schema(
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
      index: true,
    },
    state: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7],
      default: 1,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

AgentStateSchema.index({ agentId: 1, experimentRunId: 1 }, { unique: true });


export const AgentState = mongoose.model("AgentState", AgentStateSchema);

import mongoose from "mongoose";

const AgentStateSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
    index:true,
  },

  state: {
    type: String,
    enum: ["inactive", "waiting", "active"],
    default: "inactive",
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


export const AgentState = mongoose.model("AgentState", AgentStateSchema);

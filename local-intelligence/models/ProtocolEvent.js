import mongoose from "mongoose";

const ProtocolEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["runtime", "protocol", "experiment", "analytics"],
      required: true,
    },

    schemaVersion: {
      type: String,
      default: "1.0",
    },

    namespace: {
      type: String,
      default: null,
      index: true,
    },

    // Related experiment
    experimentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
      default: null,
      index: true,
    },

    // Related agent/device
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
      index: true,
    },

    // Related session
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },

    // Related signal
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Signal",
      default: null,
    },

    // Related propagation
    propagationEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropagationEvent",
      default: null,
    },

    performerId: {
      type: Number,
      default: null,
      index: true,
    },

    reason: {
      type: String,
      default: null,
    },

    detail: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    socketId: {
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

ProtocolEventSchema.index({
  type: 1,
  timestamp: -1,
});

ProtocolEventSchema.index({
  experimentRunId: 1,
  timestamp: -1,
});

export const ProtocolEvent = mongoose.model(
  "ProtocolEvent",
  ProtocolEventSchema,
);

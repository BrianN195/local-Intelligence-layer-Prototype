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
      type: String,
      ref: "ExperimentRun",
      default: null,
      index: true,
    },

    // Related agent/device
    agentId: {
      type: String,
      ref: "Agent",
      default: null,
      index: true,
    },

    // Optional external Crowds session identifier.
    sessionId: {
      type: String,
      trim: true,
      default: null,
    },

    // Related signal
    signalId: {
      type: String,
      ref: "Signal",
      default: null,
    },

    // Related propagation
    propagationEventId: {
      type: String,
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

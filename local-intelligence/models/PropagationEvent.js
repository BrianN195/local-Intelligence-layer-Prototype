import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

const PropagationEventSchema = new mongoose.Schema(
  {
    // Related signal
    signalId: {
      type: String,
      ref: "Signal",
      required: true,
    },

    // Experiment reference
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },

    // Neighborhood reference
    neighborhoodId: {
      type: String,
      ref: "Neighborhood",
      default: null,
      index: true,
    },

    // Source Agent
    sourceAgentId: {
      type: String,
      ref: "Agent",
      default: null,
      index: true,
    },

    // Target Agent
    targetAgentId: {
      type: String,
      ref: "Agent",
      default: null,
      index: true,
    },

    signalType: { type: String, default: null },
    parentSignalId: {
      type: String,
      ref: "Signal",
      default: null,
    },
    signalStrength: { type: Number, default: 0 },
    ttlRemaining: { type: Number, min: 0, default: 0 },
    delayMs: { type: Number, min: 0, default: null },
    localStateBefore: { type: mongoose.Schema.Types.Mixed, default: null },
    localStateAfter: { type: mongoose.Schema.Types.Mixed, default: null },
    sourceState: { type: mongoose.Schema.Types.Mixed, default: null },
    targetState: { type: mongoose.Schema.Types.Mixed, default: null },
    triggeredRules: [
      {
        type: String,
        ref: "Rule",
      },
    ],

    // Rules that triggered this propagation
    triggeredRuleIds: [
      {
        type: String,
        ref: "Rule",
      },
    ],

    // Signal propagation properties
    properties: {
      strength: {
        type: Number,
        default: null,
      },

      latency: {
        type: Number,
        default: null,
      },

      hopCount: {
        type: Number,
        default: 0,
      },

      distance: {
        type: Number,
        default: null,
      },
    },

    // State change caused by propagation
    stateChange: {
      previousState: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      newState: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    // Tracking
    correlationId: {
      type: String,
      default: randomUUID,
      index: true,
    },

    // Processing status
    status: {
      type: String,
      enum: [
        "created",
        "sent",
        "received",
        "processed",
        "success",
        "blocked",
        "failed",
      ],
      default: "created",
      index: true,
    },

    // Timing information
    timing: {
      createdAt: {
        type: Date,
        default: Date.now,
      },

      receivedAt: {
        type: Date,
        default: null,
      },

      processedAt: {
        type: Date,
        default: null,
      },
    },

    // Link to old infrastructure
    protocolEventId: {
      type: String,
      ref: "ProtocolEvent",
      default: null,
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

// Indexes

PropagationEventSchema.index({
  experimentRunId: 1,
  createdAt: -1,
});

PropagationEventSchema.index({
  sourceAgentId: 1,
  targetAgentId: 1,
});

PropagationEventSchema.index({
  signalId: 1,
});

export const PropagationEvent = mongoose.model(
  "PropagationEvent",
  PropagationEventSchema,
);

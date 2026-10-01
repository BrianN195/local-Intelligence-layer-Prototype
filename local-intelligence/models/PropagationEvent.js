import mongoose from "mongoose";

const PropagationEventSchema = new mongoose.Schema(
  {
    // Related signal
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Signal",
      required: true,
    },

    // Experiment reference
    experimentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },

    // Neighborhood reference
    neighborhoodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Neighborhood",
      default: null,
      index: true,
    },

    // Source Agent
    sourceAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    // Target Agent
    targetAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    // Rules that triggered this propagation
    triggeredRuleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
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
      required: true,
      index: true,
    },

    // Processing status
    status: {
      type: String,
      enum: ["created", "sent", "received", "processed", "blocked", "failed"],
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
      type: mongoose.Schema.Types.ObjectId,
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

// Optional cleanup of old propagation logs
PropagationEventSchema.index(
  {
    createdAt: 1,
  },
  {
    expireAfterSeconds: 1800,
  },
);

export const PropagationEvent = mongoose.model(
  "PropagationEvent",
  PropagationEventSchema,
);

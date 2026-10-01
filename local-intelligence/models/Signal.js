import mongoose from "mongoose";

const SignalSchema = new mongoose.Schema(
  {
    // Signal type
    type: {
      type: String,
      required: true,
      index: true,
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
      required: true,
      index: true,
    },

    // Target Agent
    targetAgentId: {
      type: String,
      ref: "Agent",
      default: null,
      index: true,
    },

    targetNeighborhoodId: {
      type: String,
      ref: "Neighborhood",
      default: null,
      index: true,
    },

    parentSignalId: {
      type: String,
      ref: "Signal",
      default: null,
      index: true,
    },

    // Signal content
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Signal properties
    properties: {
      strength: {
        type: Number,
        default: null,
      },

      priority: {
        type: String,
        default: "normal",
      },

      ttl: {
        type: Number,
        default: null,
      },

      propagationMode: {
        type: String,
        enum: ["broadcast", "random", "priority", "unicast"],
        default: "broadcast",
      },

      propagationScope: {
        type: String,
        enum: [
          "neighborhood",
          "adjacent",
          "specific",
          "direction",
          "route",
          "all",
          "global",
        ],
        default: "neighborhood",
      },

      propagationDirection: {
        type: String,
        default: null,
      },

      hopCount: {
        type: Number,
        default: 0,
      },
    },

    // Processing status
    status: {
      type: String,
      enum: [
        "created",
        "processing",
        "propagated",
        "completed",
        "blocked",
        "sent",
        "received",
        "processed",
        "failed",
      ],
      default: "created",
      index: true,
    },

    // Correlation ID for tracing
    correlationId: {
      type: String,
      index: true,
    },

    visitedAgents: [
      {
        type: String,
        ref: "Agent",
      },
    ],

    blocked: { type: Boolean, default: false },

    // Optional ProtocolEvent link
    protocolEventId: {
      type: String,
      ref: "ProtocolEvent",
      default: null,
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

// Indexes for frequent queries

// Latest signals from an agent
SignalSchema.index({
  sourceAgentId: 1,
  timestamp: -1,
});

// Signals inside an experiment
SignalSchema.index({
  experimentRunId: 1,
  timestamp: -1,
});


export const Signal = mongoose.model("Signal", SignalSchema);

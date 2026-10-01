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
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
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

      hopCount: {
        type: Number,
        default: 0,
      },
    },

    // Processing status
    status: {
      type: String,
      enum: ["created", "sent", "received", "processed", "failed"],
      default: "created",
      index: true,
    },

    // Correlation ID for tracing
    correlationId: {
      type: String,
      index: true,
    },

    // Optional ProtocolEvent link
    protocolEventId: {
      type: mongoose.Schema.Types.ObjectId,
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


// Remove old signals after 30 minutes
SignalSchema.index(
  {
    timestamp: 1,
  },
  {
    expireAfterSeconds: 1800,
  },
);

export const Signal = mongoose.model("Signal", SignalSchema);

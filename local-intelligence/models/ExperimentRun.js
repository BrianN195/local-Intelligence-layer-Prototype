import mongoose from "mongoose";

const ExperimentRunSchema = new mongoose.Schema(
  {
    // Existing Session
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      index: true,
    },
    environment: {
      type: String,
      enum: ["test", "rehearsal", "research", "production"],
      default: "test",
      index: true,
    },
    // Experiment Status
    status: {
      type: String,
      enum: ["created", "running", "paused", "finished", "failed", "cancelled"],
      default: "created",
      index: true,
    },

    // Lifecycle
    lifecycle: {
      currentPhase: {
        type: String,
        default: "initialization",
      },

      previousPhase: {
        type: String,
        default: null,
      },
    },

    // Time
    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    // Active Rule Set
    activeRuleSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RuleSet",
      default: null,
    },

    // Current Neighborhood
    currentNeighborhoodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Neighborhood",
      default: null,
    },

    // Existing Protocol Events
    protocolEventIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProtocolEvent",
      },
    ],

    // Optional linked devices/sessions
    sessionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],

    // Statistics
    statistics: {
      observationCount: {
        type: Number,
        default: 0,
      },

      signalCount: {
        type: Number,
        default: 0,
      },

      propagationCount: {
        type: Number,
        default: 0,
      },

      participantCount: {
        type: Number,
        default: 0,
      },
      agentCount: {
        type: Number,
        default: 0,
      },
    },

    // Diagnostics
    warningCount: {
      type: Number,
      default: 0,
    },

    failureCount: {
      type: Number,
      default: 0,
    },

    // Final Result
    summary: {
      type: String,
      default: "",
    },

    result: {
      type: String,
      default: "",
    },

    // Additional Information
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Frequently used indexes

ExperimentRunSchema.index({ startedAt: -1 });

ExperimentRunSchema.index({ activeRuleSetId: 1 });

ExperimentRunSchema.index({ currentNeighborhoodId: 1 });

export const ExperimentRun = mongoose.model(
  "ExperimentRun",
  ExperimentRunSchema,
);

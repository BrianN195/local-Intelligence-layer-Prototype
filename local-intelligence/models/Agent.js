import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },
    // Device identity
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    // Current state reference
    stateId: {
      type: Number,
      default: 1,
    },
    // Current neighborhood
    neighborhoodId: {
      type: String,
      ref: "Neighborhood",
      default: null,
      index: true,
    },
    // Device information
    deviceInfo: {
      model: {
        type: String,
        default: null,
      },

      platform: {
        type: String,
        default: null,
      },

      version: {
        type: String,
        default: null,
      },
    },
    position: {
      row: {
        type: Number,
        required: true,
      },
      col: {
        type: Number,
        required: true,
      },
      // Kept for compatibility with the replacement-agent service.
      x: {
        type: Number,
        default: null,
      },
      y: {
        type: Number,
        default: null,
      },
    },
    direction: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      min: 0,
      default: 1,
    },
    autonomy: {
      enabled: {
        type: Boolean,
        default: true,
      },
      suspendedUntil: {
        type: Date,
        default: null,
      },
    },
    // Connection status
    status: {
      type: String,
      enum: ["offline", "online", "busy"],
      default: "online",
      index: true,
    },
    // Last communication
    lastSeen: {
      type: Date,
      default: Date.now,
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
AgentSchema.index({
  experimentRunId: 1,
  neighborhoodId: 1,
  status: 1,
});
AgentSchema.index({ experimentRunId: 1, deviceId: 1 }, { unique: true });

export const Agent = mongoose.model("Agent", AgentSchema);

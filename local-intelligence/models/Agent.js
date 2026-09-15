import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema(
  {
    // Device identity
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Current state reference
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentState",
      default: null,
    },
    // Current neighborhood
    neighborhoodId: {
      type: mongoose.Schema.Types.ObjectId,
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
    },
    direction: {
      type: Number,
      default: 0,
    },
    // Connection status
    status: {
      type: String,
      enum: ["offline", "online", "busy"],
      default: "offline",
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
  neighborhoodId: 1,
  status: 1,
});

export const Agent = mongoose.model("Agent", AgentSchema);

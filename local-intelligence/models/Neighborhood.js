import mongoose from "mongoose";

const NeighborhoodSchema = new mongoose.Schema(
  {
    // Related experiment
    experimentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    // Members
    agentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
      },
    ],
    // Neighborhood configuration
    configuration: {
      topology: {
        type: String,
        default: "dynamic",
      },
      maxNeighbors: {
        type: Number,
        default: null,
      },
      algorithm: {
        type: String,
        default: null,
      },
      communicationRange: {
        type: Number,
        default: null,
      },
    },
    globalBounds: {
      rowStart: {
        type: Number,
        required: true,
      },
      rowEnd: {
        type: Number,
        required: true,
      },
      colStart: {
        type: Number,
        required: true,
      },
      colEnd: {
        type: Number,
        required: true,
      },
    },
    neighbors: {
      north: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Neighborhood",
        default: null,
      },
      south: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Neighborhood",
        default: null,
      },
      east: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Neighborhood",
        default: null,
      },
      west: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Neighborhood",
        default: null,
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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
NeighborhoodSchema.index({
  experimentRunId: 1,
});

export const Neighborhood = mongoose.model("Neighborhood", NeighborhoodSchema);

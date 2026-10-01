import mongoose from "mongoose";

const NeighborhoodSchema = new mongoose.Schema(
  {
    // Related experiment
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    // Members
    agentIds: [
      {
        type: String,
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
    bounds: {
      rowStart: {
        type: Number,
        default: null,
      },
      rowEnd: {
        type: Number,
        default: null,
      },
      colStart: {
        type: Number,
        default: null,
      },
      colEnd: {
        type: Number,
        default: null,
      },
    },
    neighbors: [
      {
        neighborhoodId: {
          type: String,
          ref: "Neighborhood",
          required: true,
        },
        direction: {
          type: String,
          enum: [
            "north",
            "south",
            "east",
            "west",
            "northeast",
            "northwest",
            "southeast",
            "southwest",
          ],
          required: true,
        },
        distance: { type: Number, min: 0, default: 1 },
      },
    ],
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
NeighborhoodSchema.index(
  { experimentRunId: 1, name: 1 },
  { unique: true, partialFilterExpression: { name: { $gt: "" } } },
);

export const Neighborhood = mongoose.model("Neighborhood", NeighborhoodSchema);

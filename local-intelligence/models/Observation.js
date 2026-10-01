import mongoose from "mongoose";

const ObservationSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },

    agentId: {
      type: String,
      ref: "Agent",
      default: null,
      index: true,
    },

    type: {
      type: String,
      required: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    source: {
      type: String,
      default: null,
    },

    description: {
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

ObservationSchema.index({
  experimentRunId: 1,
  timestamp: -1,
});

export const Observation = mongoose.model("Observation", ObservationSchema);

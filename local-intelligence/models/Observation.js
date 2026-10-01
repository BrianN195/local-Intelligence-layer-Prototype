import mongoose from "mongoose";

const ObservationSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
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

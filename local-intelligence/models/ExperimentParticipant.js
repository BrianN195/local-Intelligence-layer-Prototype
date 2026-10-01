import mongoose from "mongoose";

const ExperimentParticipantSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      //  index:true
    },

    agentId: {
      type: String,
      ref: "Agent",
      required: true,
      index: true,
    },

    neighborhoodId: {
      type: String,
      ref: "Neighborhood",
      default: null,
      index: true,
    },

    joinTime: {
      type: Date,
      default: Date.now,
    },

    leaveTime: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "active", "left", "failed"],
      default: "pending",
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

ExperimentParticipantSchema.index(
  {
    experimentRunId: 1,
    agentId: 1,
  },
  {
    unique: true,
  },
);

export const ExperimentParticipant = mongoose.model(
  "ExperimentParticipant",
  ExperimentParticipantSchema,
);

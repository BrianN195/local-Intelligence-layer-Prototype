import mongoose from "mongoose";

const neighborRelationSchema = new mongoose.Schema(
  {
    sourceAgent: {
      type: String,
      ref: "Agent",
      required: true,
      index: true,
    },

    targetAgent: {
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

    distance: { type: Number, min: 0, default: null },
    strength: { type: Number, min: 0, max: 1, default: null },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

neighborRelationSchema.index(
  { sourceAgent: 1, targetAgent: 1 },
  { unique: true },
); // unique

export const NeighborhoodRelation = mongoose.model(
  "NeighborhoodRelation",
  neighborRelationSchema,
);

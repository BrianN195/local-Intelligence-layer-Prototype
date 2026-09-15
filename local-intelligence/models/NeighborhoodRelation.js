import mongoose from "mongoose";

const neighborRelationSchema = new mongoose.Schema(
  {
    sourceAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    targetAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    distance: Number,
    strength: Number,
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

neighborRelationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 }); // 30 minuten

export const NeighborhoodRelation = mongoose.model(
  "NeighborRelation",
  neighborRelationSchema,
);

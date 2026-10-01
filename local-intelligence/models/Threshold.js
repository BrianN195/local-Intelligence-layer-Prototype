import mongoose from "mongoose";

const thresholdSchema = new mongoose.Schema(
  {
    ruleId: {
      type: String,
      ref: "Rule",
      required: true,
      index: true,
    },

    metric: { type: String, required: true, trim: true },
    operator: {
      type: String,
      enum: ["threshold", "equals", "greaterThan", "lessThan"],
      required: true,
    },
    value: { type: Number, required: true, validate: Number.isFinite },
  },
  { timestamps: true },
);

thresholdSchema.index({ ruleId: 1, metric: 1 });

export const Threshold = mongoose.model("Threshold", thresholdSchema);

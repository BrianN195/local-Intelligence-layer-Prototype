import mongoose from "mongoose";

const thresholdSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rule",
      required: true,
      index: true,
    },

    metric: String,
    operator: String,
    value: Number,
  },
  { timestamps: true },
);

export const Threshold = mongoose.model("Threshold", thresholdSchema);

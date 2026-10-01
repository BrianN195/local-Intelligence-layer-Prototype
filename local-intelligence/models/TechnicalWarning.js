import mongoose from "mongoose";

const TechnicalWarningSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      default: null,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "runtime",
        "protocol",
        "experiment",
        "neighborhood",
        "signal",
        "data",
        "lifecycle",
      ],
      default: "runtime",
      index: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "error", "critical"],
      default: "warning",
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      default: "UNSPECIFIED_WARNING",
      index: true,
    },
    type: { type: String, default: null },
    message: { type: String, required: true, trim: true },
    detail: { type: mongoose.Schema.Types.Mixed, default: null },
    signalId: {
      type: String,
      ref: "Signal",
      default: null,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    resolved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

TechnicalWarningSchema.index({ experimentRunId: 1, timestamp: -1 });

export const TechnicalWarning = mongoose.model(
  "TechnicalWarning",
  TechnicalWarningSchema,
);
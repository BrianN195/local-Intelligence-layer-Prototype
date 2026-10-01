import mongoose from "mongoose";

const ObservationMetricSchema = new mongoose.Schema(
  {
    experimentRunId: {
      type: String,
      ref: "ExperimentRun",
      required: true,
      index: true,
    },
    type: { type: String, required: true, trim: true, index: true },
    value: { type: Number, required: true, validate: Number.isFinite },
    timestamp: { type: Date, default: Date.now, index: true },
    dimensions: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

ObservationMetricSchema.index({ experimentRunId: 1, type: 1, timestamp: -1 });

export const ObservationMetric = mongoose.model(
  "ObservationMetric",
  ObservationMetricSchema,
);

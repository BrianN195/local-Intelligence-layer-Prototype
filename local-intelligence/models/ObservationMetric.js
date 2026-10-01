const ObservationMetricSchema = new mongoose.Schema({
  experimentRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExperimentRun",
  },
  type: String,
  value: Number,
  timestamp: { type: Date, default: Date.now },
});

export const ObservationMetric = mongoose.model(
  "ObservationMetric",
  ObservationMetricSchema,
);

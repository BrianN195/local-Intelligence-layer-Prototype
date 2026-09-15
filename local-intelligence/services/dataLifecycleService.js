import {
  ExperimentRun,
  ExperimentParticipant,
  PropagationEvent,
  Observation,
  ProtocolEvent,
  TechnicalWarning,
  FailureState,
  Signal,
} from "../models/index.js";

export async function cleanupTestExperiment(experimentRunId) {
  const experiment = await ExperimentRun.findById(experimentRunId);

  if (!experiment) {
    throw new Error("Experiment not found.");
  }

  if (experiment.environment !== "test") {
    await TechnicalWarning.create({
      experimentRunId,
      category: "lifecycle",
      severity: "warning",
      code: "INVALID_CLEANUP_REQUEST",
      message: "Cleanup requested for a non-test experiment.",
    });
    throw new Error(
      "Only test experiments can be permanently deleted by this cleanup service.",
    );
  }

  if (experiment.status === "running") {
    throw new Error("Running experiments cannot be deleted.");
  }

  await Promise.all([
    ExperimentParticipant.deleteMany({
      experimentRunId,
    }),

    Signal.deleteMany({
      experimentRunId,
    }),

    PropagationEvent.deleteMany({
      experimentRunId,
    }),

    Observation.deleteMany({
      experimentRunId,
    }),

    ProtocolEvent.deleteMany({
      experimentRunId,
    }),

    TechnicalWarning.deleteMany({
      experimentRunId,
    }),

    FailureState.deleteMany({
      experimentRunId,
    }),
  ]);

  await ExperimentRun.findByIdAndDelete(experimentRunId);

  return {
    experimentRunId,
    deleted: true,
  };
}

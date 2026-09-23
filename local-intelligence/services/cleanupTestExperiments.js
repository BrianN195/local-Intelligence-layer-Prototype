import {
  ExperimentRun,
  ExperimentParticipant,
  Signal,
  PropagationEvent,
  Observation,
  ProtocolEvent,
  TechnicalWarning,
  FailureState,
} from "../models/index.js";

export async function cleanupOldTestExperiments() {
  const expirationDate = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  const oldExperiments = await ExperimentRun.find({
    environment: "test",

    status: {
      $in: ["finished", "failed", "cancelled"],
    },

    endedAt: {
      $lt: expirationDate,
    },
  }).select("_id");

  let deletedCount = 0;

  for (const experiment of oldExperiments) {
    const experimentRunId = experiment._id;

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

    await ExperimentRun.findByIdAndDelete(
      experimentRunId
    );

    deletedCount++;
  }

  return {
    deletedExperiments: deletedCount,
  };
}
import { randomUUID } from "crypto";
import runAutonomy from "./runAutonomy.js";

export default function runAutonomyTicks(
  run,
  tickCount = 1,
) {
  const ticks = [];

  for (let i = 0; i < tickCount; i++) {
    const tickId = randomUUID();

    const decisions = runAutonomy(run);

    const tick = {
      id: tickId,

      experimentRunId: run.id,

      tick: i + 1,

      type: "autonomy",

      decisions,

      timestamp: new Date().toISOString(),
    };

    run.autonomyTicks.push(tick);

    ticks.push(tick);
  }

  return ticks;
}
import { randomUUID } from "crypto";
import simulationTick from "../simulation/simulationTick.js";

export default function runAutonomyTicks(run, tickCount = 1) {

  const ticks = [];

  for (let i = 0; i < tickCount; i++) {
    const tickId = randomUUID();

    const simulation = simulationTick(run);
    const decisions = simulation.autonomy.decisions;

    // =========================================
    // TICK STATISTICS
    // =========================================

    const statistics = {
      ...simulation.autonomy.statistics,
      noStateChange: decisions.filter((d) => d.stateChanged === false).length,
    };

    const tick = {
      id: tickId,
      experimentRunId: run.id,
      tick: i + 1,
      type: "autonomy",
      decisions,
      statistics,
      timestamp: new Date().toISOString(),
    };

    run.autonomyTicks.push(tick);
    

    ticks.push(tick);
  }

  return ticks;
}

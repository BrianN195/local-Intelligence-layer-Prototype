import simulationTick from "./simulationTick.js";
import { randomUUID } from "crypto";

export default function runSimulation(run, tickCount = 1) {
  if (!run) return null;

  if (!run.simulationTicks) {
    run.simulationTicks = [];
  }

  const ticks = [];
  const startTick = run.simulationTicks.length + 1;

  for (let i = 0; i < tickCount; i++) {
    const simulation = simulationTick(run);

    const tick = {
      id: randomUUID(),
      experimentRunId: run.id,
      tick: startTick + i,
      type: "simulation",
      simulation,
      timestamp: new Date().toISOString(),
    };

    run.simulationTicks.push(tick);
    ticks.push(tick);
  }

  return ticks;
}
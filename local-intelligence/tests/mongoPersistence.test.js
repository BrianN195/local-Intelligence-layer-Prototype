import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { Agent } from "../models/Agent.js";
import { ExperimentRun } from "../models/ExperimentRun.js";
import {
  restoreExperimentRuns,
  saveExperimentRun,
} from "../services/runPersistence.js";
import { store } from "../store.js";

const configuredUri = process.env.MONGODB_TEST_URI ?? process.env.MONGODB_URI;

test("Agent schema requires positive row and col coordinates", async () => {
  const validAgent = new Agent({
    experimentRunId: "run-test",
    deviceId: "device-test",
    position: { row: 2, col: 3 },
  });
  await validAgent.validate();
  assert.equal(validAgent.status, "online");

  const invalidAgent = new Agent({
    experimentRunId: "run-test",
    deviceId: "device-without-position",
  });
  await assert.rejects(invalidAgent.validate(), { name: "ValidationError" });
});

function testDatabaseUri(uri) {
  const parsed = new URL(uri);
  const sourceDatabase = parsed.pathname.replace(/^\//, "") || "local_intelligence";
  parsed.pathname = `/${sourceDatabase}_test`;
  return parsed.toString();
}

test("experiment snapshots survive restore from MongoDB", async (t) => {
  if (!configuredUri) {
    t.skip("Set MONGODB_URI (or MONGODB_TEST_URI) to run the MongoDB integration test.");
    return;
  }

  const testId = `mongo-persistence-test-${process.pid}-${Date.now()}`;
  const originalRuns = [...store.experimentRuns];

  await mongoose.connect(testDatabaseUri(configuredUri));
  try {
    const run = {
      id: testId,
      environment: "test",
      status: "running",
      agents: [{ id: "agent-test", position: { row: 2, col: 3 } }],
      neighborhoods: [{ id: "neighborhood-test", agentIds: ["agent-test"] }],
      rulesets: [{ id: "ruleset-test", rules: [{ id: "rule-test" }] }],
      signals: [{ id: "signal-test", payload: { strength: 0.75 } }],
      stateHistory: [{ id: "history-test", newState: 3 }],
      propagationEvents: [],
      observationMetrics: [],
      statistics: { signalCount: 1 },
      warningCount: 0,
      failureCount: 0,
      summary: "Persistence integration test",
      result: "",
      metadata: {},
    };

    await saveExperimentRun(run);
    store.experimentRuns.splice(0, store.experimentRuns.length, run);
    await restoreExperimentRuns();

    const restoredRun = store.experimentRuns.find((item) => item.id === testId);
    assert.ok(restoredRun, "the saved run is restored from MongoDB");
    assert.equal(restoredRun.agents[0].position.row, 2);
    assert.equal(restoredRun.rulesets[0].rules[0].id, "rule-test");
    assert.equal(restoredRun.signals[0].payload.strength, 0.75);

    const document = await ExperimentRun.findById(testId).lean();
    assert.equal(document.snapshotVersion, 1);
    assert.equal(document.data.id, testId);
  } finally {
    await ExperimentRun.deleteOne({ _id: testId });
    store.experimentRuns.splice(0, store.experimentRuns.length, ...originalRuns);
    await mongoose.disconnect();
  }
});

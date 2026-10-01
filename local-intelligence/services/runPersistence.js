import { ExperimentRun } from "../models/ExperimentRun.js";
import { store } from "../store.js";

const MAX_SNAPSHOT_BYTES = 14 * 1024 * 1024;
const pendingWrites = new Map();

export async function restoreExperimentRuns() {
  const documents = await ExperimentRun.find({ data: { $exists: true } })
    .select({ _id: 1, data: 1, snapshotVersion: 1 })
    .lean();

  store.experimentRuns.splice(0, store.experimentRuns.length);

  for (const document of documents) {
    const run = document.data;
    if (!run || typeof run !== "object" || typeof run.id !== "string") {
      console.warn(`Skipping invalid experiment snapshot ${document._id}.`);
      continue;
    }
    store.experimentRuns.push(run);
  }

  console.log(`Restored ${store.experimentRuns.length} experiment run(s) from MongoDB.`);
  return store.experimentRuns.length;
}

export function saveExperimentRun(run) {
  if (!run || typeof run.id !== "string" || run.id.length === 0) {
    return Promise.reject(new Error("Cannot persist an experiment without a string id."));
  }

  let data;
  let serialized;
  try {
    serialized = JSON.stringify(run);
    data = JSON.parse(serialized);
  } catch (error) {
    return Promise.reject(new Error(`Experiment ${run.id} cannot be serialized: ${error.message}`));
  }

  const approximateBytes = Buffer.byteLength(serialized, "utf8");
  if (approximateBytes > MAX_SNAPSHOT_BYTES) {
    const error = new Error(
      `Experiment ${run.id} snapshot is ${approximateBytes} bytes; the safety limit is ${MAX_SNAPSHOT_BYTES}. Move growing logs to separate collections before scaling this run.`,
    );
    error.code = "EXPERIMENT_SNAPSHOT_TOO_LARGE";
    return Promise.reject(error);
  }

  const previousWrite = pendingWrites.get(run.id) ?? Promise.resolve();
  const write = previousWrite
    .catch(() => {})
    .then(() =>
      ExperimentRun.updateOne(
        { _id: run.id },
        {
          $set: {
            data,
            snapshotVersion: 1,
            status: run.status ?? "created",
            environment: run.environment ?? "test",
            startedAt: run.startedAt ? new Date(run.startedAt) : null,
            endedAt: run.endedAt ? new Date(run.endedAt) : null,
            activeRuleSetId: run.activeRuleSetId ?? null,
            currentNeighborhoodId: run.currentNeighborhoodId ?? null,
            statistics: run.statistics ?? {},
            warningCount: run.warningCount ?? 0,
            failureCount: run.failureCount ?? 0,
            summary: run.summary ?? "",
            result: run.result ?? "",
            metadata: run.metadata ?? {},
          },
        },
        { upsert: true, runValidators: true },
      ),
    );

  pendingWrites.set(run.id, write);
  return write.finally(() => {
    if (pendingWrites.get(run.id) === write) pendingWrites.delete(run.id);
  });
}

export async function saveAllExperimentRuns() {
  await Promise.all(store.experimentRuns.map((run) => saveExperimentRun(run)));
}

export function findRunForRequest(req) {
  const candidateIds = [
    req.params?.id,
    req.params?.experimentRunId,
    req.body?.experimentRunId,
    req.query?.experimentRunId,
  ].filter((id) => typeof id === "string" && id.length > 0);

  for (const id of candidateIds) {
    const directMatch = store.experimentRuns.find((run) => run.id === id);
    if (directMatch) return directMatch;
  }

  const resourceIds = new Set([
    req.params?.id,
    req.params?.agentId,
    req.body?.agentId,
    ...(Array.isArray(req.body?.agentIds) ? req.body.agentIds : []),
  ].filter((id) => typeof id === "string" && id.length > 0));

  if (resourceIds.size === 0) return null;

  return store.experimentRuns.find((run) => {
    if (run.agents?.some((agent) => resourceIds.has(agent.id))) return true;
    if (run.neighborhoods?.some((neighborhood) => resourceIds.has(neighborhood.id))) return true;
    if (run.rulesets?.some((ruleset) => resourceIds.has(ruleset.id))) return true;
    if (run.rulesets?.some((ruleset) => ruleset.rules?.some((rule) => resourceIds.has(rule.id)))) return true;
    return run.signals?.some((signal) => resourceIds.has(signal.id));
  }) ?? null;
}

export function persistenceMiddleware(req, res, next) {
  const sendJson = res.json.bind(res);

  res.json = (body) => {
    if (res.locals.skipRunPersistence) return sendJson(body);

    const run = findRunForRequest(req);
    if (!run) return sendJson(body);

    saveExperimentRun(run)
      .then(() => sendJson(body))
      .catch(next);

    return res;
  };

  next();
}

export function startPersistenceFlush(intervalMs = 3000) {
  const interval = setInterval(() => {
    saveAllExperimentRuns().catch((error) => {
      console.error("Failed to flush experiment snapshots to MongoDB:", error.message);
    });
  }, intervalMs);

  interval.unref();
  return () => clearInterval(interval);
}

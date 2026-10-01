import express from "express";
import cors from "cors";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import experimentRoutes from "./routes/experimentRun.js";
import agentRoutes from "./routes/agents.js";
import neighborhoodRoutes from "./routes/neighborhoods.js";
import signalRoutes from "./routes/signals.js";
import rulesetRoutes from "./routes/rulesets.js";
import evaluateRuleRoutes from "./routes/rules.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import {
  persistenceMiddleware,
  restoreExperimentRuns,
  saveAllExperimentRuns,
  startPersistenceFlush,
} from "./services/runPersistence.js";
import { stopExperimentScheduler } from "./services/scheduling/experimentScheduler.js";
import { seed } from "./seedScript.js";
import { store } from "./store.js";
import dotenv from "dotenv";

const appDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(appDirectory, ".env") });

export const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(persistenceMiddleware);

app.use(experimentRoutes);
app.use(agentRoutes);
app.use(neighborhoodRoutes);
app.use(signalRoutes);
app.use(rulesetRoutes);
app.use(evaluateRuleRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  res.locals.skipRunPersistence = true;
  console.error("Request failed:", error);
  if (error.code === "EXPERIMENT_SNAPSHOT_TOO_LARGE") {
    return res.status(413).json({ error: error.message });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: "Internal server error" });
});

export async function startServer() {
  await connectDatabase();
  await restoreExperimentRuns();

  const port = Number(process.env.PORT ?? 3000);
  const server = await new Promise((resolveServer, reject) => {
    const httpServer = app.listen(port);
    httpServer.once("listening", () => resolveServer(httpServer));
    httpServer.once("error", reject);
  });

  const stopFlush = startPersistenceFlush(
    Number(process.env.PERSISTENCE_FLUSH_INTERVAL_MS ?? 3000),
  );
  console.log(`Local Intelligence running on port ${port}.`);

  if (process.env.SEED_DEMO === "true") {
    seed().catch((error) => {
      console.error("Demo seed failed:", error.message);
    });
  }

  let isClosing = false;
  const shutdown = async (signal) => {
    if (isClosing) return;
    isClosing = true;
    console.log(`${signal} received; saving and closing gracefully.`);
    stopFlush();
    for (const run of store.experimentRuns) {
      stopExperimentScheduler(run.id);
    }
    server.close(async (error) => {
      try {
        await saveAllExperimentRuns();
        await disconnectDatabase();
        if (error) throw error;
        process.exitCode = 0;
      } catch (shutdownError) {
        console.error("Graceful shutdown failed:", shutdownError);
        process.exitCode = 1;
      }
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return server;
}

const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  startServer().catch(async (error) => {
    console.error("Local Intelligence could not start:", error.message);
    await disconnectDatabase().catch(() => {});
    process.exitCode = 1;
  });
}

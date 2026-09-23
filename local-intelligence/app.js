import express from "express";
import cors from "cors";

import experimentRoutes from "./routes/experimentRun.js";
import agentRoutes from "./routes/agents.js";
import neighborhoodRoutes from "./routes/neighborhoods.js";
import signalRoutes from "./routes/signals.js";
import rulesetRoutes from "./routes/rulesets.js";
import evaluateRuleRoutes from "./routes/rules.js";
import { seed } from "./seedScript.js";

const app = express();
app.use(cors());
app.use(express.json());





app.use(experimentRoutes);
app.use(agentRoutes);
app.use(neighborhoodRoutes);
app.use(signalRoutes);
app.use(rulesetRoutes);
app.use(evaluateRuleRoutes);



seed().catch((error) => {
  console.error("\nSeed failed:");

  console.error(error.message);
});
// ================FOR AUTOMATE AUTONOMUS AGENTS======================================
// if you want turn off, select the rows (37-60) and commit it out (STRG+SHIFT+7) 

// const API = "http://localhost:3000";
// async function post(endpoint, body) {
//   const res = await fetch(`${API}${endpoint}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(body),
//   });

//   if (!res.ok) {
//     const error = await res.text();

//     throw new Error(`${res.status}: ${error}`);
//   }

//   return await res.json();
// }

// setInterval(() => {
//   post("/experiment-runs/experiment-9x9-test/simulation/ticks", {
//     tickCount: 1,
//   });
// }, 3000);
// ======================================================


app.listen(3000, () => {
  console.log("Local Intelligence running on port 3000");
});
import express from "express";

import experimentRoutes from "./routes/experimentRun.js";
import agentRoutes from "./routes/agents.js";
import neighborhoodRoutes from "./routes/neighborhoods.js";
import signalRoutes from "./routes/signals.js";
import rulesetRoutes from "./routes/rulesets.js";
import evaluateRuleRoutes from "./routes/rules.js";


const app = express();
app.use(express.json());

app.use(experimentRoutes);
app.use(agentRoutes);
app.use(neighborhoodRoutes);
app.use(signalRoutes);
app.use(rulesetRoutes);
app.use(evaluateRuleRoutes);

app.listen(3000, () => {
  console.log("Local Intelligence running on port 3000");
});
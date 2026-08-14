// import { randomUUID } from "crypto";
// import { getStateId } from "../stateHelpers.js";
// import { processSignal } from "../engine.js";
// const actions = {
//   activate,
//   propagate,
//   block,
//   sync,
// };

// export default function executeRule(rule, signal, run) {
//   const action = actions[rule.action];

//   if (!action) {
//     if (!action) {
//       run.technicalWarnings.push({
//         id: randomUUID(),

//         experimentRunId: run.id,

//         type: "UNKNOWN_RULE_ACTION",

//         message: `Unknown rule action '${rule.action}'.`,

//         ruleId: rule.id,

//         timestamp: new Date().toISOString(),
//       });

//       run.warningCount++;

//       return false;
//     }
//   }

//   action(signal, run);
//   return true;
// }

// // ====================================================
// // ACTIVATE
// // ====================================================

// function activate(signal, run) {
//   const agent = run.agents.find((a) => a.id === signal.targetAgentId);

//   if (!agent) return;

//   agent.stateId = getStateId("active");
// }

// // ====================================================
// // BLOCK
// // ====================================================

// function block(signal) {
//   signal.blocked = true;
// }

// // ====================================================
// // PROPAGATE
// // ====================================================

// function selectNeighbors(neighbors, mode, run) {
//   switch (mode) {
//     case "random":
//       return neighbors.sort(() => Math.random() - 0.5).slice(0, 1);

//     case "broadcast":
//     default:
//       return neighbors;

//     case "priority":
//       return neighbors.sort((a, b) => {
//         const agentA = run.agents.find((agent) => agent.id === a);
//         const agentB = run.agents.find((agent) => agent.id === b);

//         return (agentB?.priority ?? 0) - (agentA?.priority ?? 0);
//       });
//   }
// }

// function propagate(signal, run) {
//   if (signal.blocked) return;

//   if ((signal.properties.ttl ?? 0) <= 0) {
//     run.technicalWarnings.push({
//       id: randomUUID(),

//       experimentRunId: run.id,

//       type: "TTL_EXPIRED",

//       message: "Signal propagation stopped because TTL reached zero.",

//       signalId: signal.id,

//       timestamp: new Date().toISOString(),
//     });

//     run.warningCount++;

//     signal.status = "completed";

//     return;
//     }

//     const sourceAgent = run.agents.find((a) => a.id === signal.targetAgentId);

//     if (!sourceAgent) return;

//     if (!sourceAgent.neighborhoodId) return;

//     const propagationMode = signal.properties?.propagationMode ?? "broadcast";

//     let propagated = false;

//     const neighborhood = run.neighborhoods.find(
//     (n) => n.id === sourceAgent.neighborhoodId,
//     );

//     if (!neighborhood) return;

//     let neighbors = [...neighborhood.agentIds];

//     neighbors = selectNeighbors(neighbors, propagationMode, run);

//     for (const neighborId of neighbors) {
//       // ---------------------------------------
//       // Skip invalid targets
//       // ---------------------------------------

//       if (neighborId === sourceAgent.id) continue;

//       if (neighborId === signal.sourceAgentId) continue;

//       if (signal.visitedAgents.includes(neighborId)) continue;

//       const alreadyQueued = run.signals.some(
//         (s) =>
//           s.parentSignalId === (signal.parentSignalId || signal.id) &&
//           s.targetAgentId === neighborId,
//       );

//       if (alreadyQueued) continue;

//       // ---------------------------------------
//       // Create propagated signal
//       // ---------------------------------------

//       const propagatedSignal = {
//         id: randomUUID(),

//         experimentRunId: run.id,

//         type: signal.type,

//         parentSignalId: signal.parentSignalId || signal.id,

//         sourceAgentId: sourceAgent.id,

//         targetAgentId: neighborId,

//         payload: structuredClone(signal.payload),

//         properties: {
//           ...signal.properties,
//           ttl: signal.properties.ttl - 1,
//           hopCount: (signal.properties.hopCount ?? 0) + 1,
//         },

//         status: "created",

//         visitedAgents: [...signal.visitedAgents, neighborId],

//         timestamp: new Date().toISOString(),

//         blocked: false,
//       };

//       run.signals.push(propagatedSignal);

//       propagated = true;

//       processSignal(propagatedSignal, run);
//     }
//   if (propagated) {
//     signal.status = "propagated";
//   }
//   }
  

// // ====================================================
// // SYNC
// // ====================================================

// function sync(signal, run) {
//   const targetAgent = run.agents.find((a) => a.id === signal.targetAgentId);

//   if (!targetAgent) return;

//   const neighborhood = run.neighborhoods.find(
//     (n) => n.id === targetAgent.neighborhoodId,
//   );

//   if (!neighborhood) return;

//   for (const agentId of neighborhood.agentIds) {
//     const agent = run.agents.find((a) => a.id === agentId);

//     if (!agent) continue;

//     agent.stateId = getStateId("synchronized");
//   }
// }

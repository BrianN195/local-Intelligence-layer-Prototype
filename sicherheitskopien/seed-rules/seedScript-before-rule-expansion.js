import { RULE_ACTIONS } from "./constants/actions.js";

const API = "http://localhost:3000";

async function post(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();

    throw new Error(`${res.status}: ${error}`);
  }

  return await res.json();
}

export async function seed() {
  const experimentId = "experiment-9x9-test";

  // 1. Create ExperimentRun
  const experiment = await post(`/experiment-runs/${experimentId}`, {});

  console.log(`Created ExperimentRun: ${experiment.id}`);

  const neighborhoods = [];
  const agents = [];

  // 2. Create 9 Neighborhoods as a 3x3 global layout
  for (let n = 0; n < 9; n++) {
    const blockRow = Math.floor(n / 3);
    const blockCol = n % 3;

    const neighborhood = await post("/neighborhoods", {
      experimentRunId: experimentId,
      bounds: {
        rowStart: blockRow * 3 + 1,
        rowEnd: blockRow * 3 + 3,
        colStart: blockCol * 3 + 1,
        colEnd: blockCol * 3 + 3,
      },
    });

    neighborhoods.push(neighborhood);

    console.log(`Created Neighborhood ${n}: ${neighborhood.id}`);

    // 3. Create 9 Agents per Neighborhood, on a local 3x3 grid
    for (let a = 0; a < 9; a++) {
      const agent = await post("/agents", {
        experimentRunId: experimentId,
        deviceId: `device-${n}-${a}`,
      });

      agents.push(agent);

      // 4. Add Agent to Neighborhood at its local position
      await post(`/neighborhoods/${neighborhood.id}/agents`, {
        experimentRunId: experimentId,
        agentId: agent.id,
        row: Math.floor(a / 3) + 1,
        col: (a % 3) + 1,
      });
    }
  }

  // 5. Connect Neighborhoods using their global bounds
  const connections = await post("/neighborhoods/connect", {
    experimentRunId: experimentId,
  });

  const ruleSet = await post("/rulesets", {
    name: "Default RuleSet",
    experimentRunId: experimentId,
  });

  const activRule = await post("/rules", {
    experimentRunId: experimentId,
    rule: {
      signalType: "propagate",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    },
  });
  const activByTapRule = await post("/rules", {
    experimentRunId: experimentId,
    rule: {
      signalType: "tap",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    },
  });
  const syncByShakeRule = await post("/rules", {
    experimentRunId: experimentId,
    rule: {
      signalType: "shake",
      action: RULE_ACTIONS.SYNC,
      threshold: 1,
    },
  });
  const propagationRule = await post("/rules", {
    experimentRunId: experimentId,
    rule: {
      signalType: "propagation",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    },
  });
  const propagationByTapRule = await post("/rules", {
    experimentRunId: experimentId,
    rule: {
      signalType: "tap",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    },
  });
  const autonomousRule = await post("/rules", {
    experimentRunId: experimentId,
    rule: {
      type: "autonomous",
      signalType: "autonomous_activation",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    },
  });
  
  console.log(
    `Added ${activRule.action}, 
    ${activByTapRule.action}, 
    ${propagationRule.action}, 
    ${propagationByTapRule.action}, 
    ${syncByShakeRule.action}, 
    ${autonomousRule.action} 
    to ${ruleSet.name}`,
  );

  console.log(`Connected ${connections.connected} Neighborhoods`);

  console.log("\n========== SEED COMPLETE ==========");

  console.log(`ExperimentRun: ${experimentId}`);

  console.log(`Neighborhoods created: ${neighborhoods.length}`);

  console.log(`Agents created: ${agents.length}`);

  console.log("\nFirst Agent:");

  console.log(agents[0]);

  console.log("\nFirst Neighborhood:");

  console.log(connections.neighborhoods[0]);
}



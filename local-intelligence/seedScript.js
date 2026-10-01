import { RULE_ACTIONS } from "./constants/actions.js";
import { PROPAGATION_SCOPES } from "./constants/propagation.js";

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

async function postRule(experimentRunId, rule) {
  return post("/rules", {
    experimentRunId,
    rule,
  });
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

  const seededRules = [];

  seededRules.push(
    await postRule(experimentId, {
      signalType: "propagate",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "tap",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "shake",
      action: RULE_ACTIONS.SYNC,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "propagation",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "tap",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      type: "autonomous",
      signalType: "autonomous_activation",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),
  );

  // Follow-up scenario:
  // Agent 1 becomes active, then sends a delayed deactivate signal to Agent 9.
  const agentOne = agents[0];
  const agentNine = agents[8];
  const agentAt5_2 = agents[13];
  const agentAt9_4 = agents[47];
  const agentAt9_7 = agents[74];
  const agentAt3_9 = agents[62];

  const sameNeighborhoodAgent = agents[12];

  seededRules.push(
    await postRule(experimentId, {
      signalType: "activate",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),
    await postRule(experimentId, {
      scope: "agent",
      agentId: agentOne.id,
      trigger: {
        type: "state_changed",
        fromState: "inactive",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 5000,
        targetAgentId: agentNine.id,
        signalType: "deactivate",
        signalPayload: {
          strength: 1,
          reason: "agent-1-became-active",
          autonomy: {
            enabled: false,
            durationMs: 10000,
          },
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: "neighborhood",
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "deactivate",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "deactivate",
      action: RULE_ACTIONS.UPDATE_AUTONOMY,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "deactivate",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );
  seededRules.push(
    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "inactive",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt9_4.id,
        signalType: "global_activate_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-active",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.ADJACENT,
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "inactive",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt9_7.id,
        signalType: "global_activate_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-active",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.ADJACENT,
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "listening",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt9_4.id,
        signalType: "global_activate_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-active",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.ADJACENT,
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "listening",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt9_7.id,
        signalType: "global_activate_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-active",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.ADJACENT,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "global_activate_from_5_2",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "global_activate_from_5_2",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );
  seededRules.push(
    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt3_9.id,
      trigger: {
        type: "state_changed",
        fromState: "inactive",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt5_2.id,
        signalType: "global_deactivate_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-3-9-became-active",
        },
        signalProperties: {
          propagationMode: "direct",
          propagationScope: "none",
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt3_9.id,
      trigger: {
        type: "state_changed",
        fromState: "waiting",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt5_2.id,
        signalType: "global_deactivate_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-3-9-became-active",
        },
        signalProperties: {
          propagationMode: "direct",
          propagationScope: "none",
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt3_9.id,
      trigger: {
        type: "state_changed",
        fromState: "listening",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt5_2.id,
        signalType: "global_deactivate_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-3-9-became-active",
        },
        signalProperties: {
          propagationMode: "direct",
          propagationScope: "none",
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "global_deactivate_5_2",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),
  );
  seededRules.push(
    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "listening",
        toState: "waiting",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: sameNeighborhoodAgent.id,
        signalType: "local_deactivate_from_5_2_waiting",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-entered-waiting",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: "neighborhood",
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "active",
        toState: "inactive",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: sameNeighborhoodAgent.id,
        signalType: "local_deactivate_from_5_2_waiting",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-entered-waiting",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: "neighborhood",
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "local_deactivate_from_5_2_waiting",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "local_deactivate_from_5_2_waiting",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );
  seededRules.push(
    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "active",
        toState: "inactive",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt9_4.id,
        signalType: "global_deactivate_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-inactive",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.ADJACENT,
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "active",
        toState: "listening",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt9_4.id,
        signalType: "global_deactivate_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-inactive",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.ADJACENT,
        },
      },
    }),

    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "active",
        toState: "inactive",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt9_7.id,
        signalType: "global_deactivate_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-inactive",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.ADJACENT,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "global_deactivate_from_5_2",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "global_deactivate_from_5_2",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );
  seededRules.push(
    await postRule(experimentId, {
      scope: "agent",
      agentId: agentAt5_2.id,
      trigger: {
        type: "state_changed",
        fromState: "inactive",
        toState: "active",
      },
      action: RULE_ACTIONS.SEND_SIGNAL,
      appendedSignal: {
        delayMs: 0,
        targetAgentId: agentAt3_9.id,
        signalType: "deactivate_3_9_from_5_2",
        signalPayload: {
          strength: 1,
          reason: "agent-5-2-became-active",
        },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "deactivate_3_9_from_5_2",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "deactivate_3_9_from_5_2",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );
  console.log(
    `Added ${seededRules.length} rules to ${ruleSet.name}, including the Agent 1 follow-up scenario.`,
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

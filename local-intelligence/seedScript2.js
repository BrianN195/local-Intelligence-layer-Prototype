import { RULE_ACTIONS } from "./constants/actions.js";
import { PROPAGATION_SCOPES } from "./constants/propagation.js";
import { RULE_TRIGGER_TYPES } from "./constants/triggers.js";

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

export async function seedTwo() {
  const experimentId = "experiment-neighborhood-chain";

  const experiment = await post(
    `/experiment-runs/${experimentId}`,
    {},
  );

  console.log(`Created ExperimentRun: ${experiment.id}`);

  const neighborhoods = [];
  const agents = [];

  // ==================================================
  // CREATE 3 × 3 NEIGHBORHOODS
  // EACH NEIGHBORHOOD HAS 3 × 3 AGENTS
  // ==================================================

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

    console.log(
      `Created Neighborhood ${n}: ${neighborhood.id}`,
    );

    for (let a = 0; a < 9; a++) {
      const agent = await post("/agents", {
        experimentRunId: experimentId,
        deviceId: `device-${n}-${a}`,
      });

      agents.push(agent);

      await post(`/neighborhoods/${neighborhood.id}/agents`, {
        experimentRunId: experimentId,
        agentId: agent.id,
        row: Math.floor(a / 3) + 1,
        col: (a % 3) + 1,
      });
    }
  }

  // Connect all neighborhoods.
  const connections = await post("/neighborhoods/connect", {
    experimentRunId: experimentId,
  });

  // ==================================================
  // RULE SET
  // ==================================================

  const ruleSet = await post("/rulesets", {
    name: "Neighborhood Chain RuleSet",
    experimentRunId: experimentId,
  });

  const seedTwoedRules = [];

  // ==================================================
  // GLOBAL SIGNAL RULES
  // ==================================================

  // Normal activation signal.
  seedTwoedRules.push(
    await postRule(experimentId, {
      signalType: "activate",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),

    // Normal deactivation signal.
    await postRule(experimentId, {
      signalType: "deactivate",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    // Update autonomy.
    await postRule(experimentId, {
      signalType: "deactivate",
      action: RULE_ACTIONS.UPDATE_AUTONOMY,
      threshold: 1,
    }),
  );

  // ==================================================
  // HELPER
  // ==================================================

  const getAgent = (neighborhoodIndex, localIndex) =>
    agents[neighborhoodIndex * 9 + localIndex];

  /*
    Neighborhood layout:

    0 | 1 | 2
    ---------
    3 | 4 | 5
    ---------
    6 | 7 | 8

    For this scenario:

    LEFT   = neighborhood 3
    CENTER = neighborhood 4
    RIGHT  = neighborhood 5

    Their center agents:

    LEFT   = local agent 4
    CENTER = local agent 4
    RIGHT  = local agent 4
  */

  const leftNeighborhood = neighborhoods[3];
  const centerNeighborhood = neighborhoods[4];
  const rightNeighborhood = neighborhoods[5];

  const leftCenterAgent = getAgent(3, 4);
  const centerAgent = getAgent(4, 4);
  const rightCenterAgent = getAgent(5, 4);

  // ==================================================
  // CENTER ALL ACTIVE
  //
  // CENTER → LEFT CENTER
  // CENTER → RIGHT CENTER
  //
  // Each signal activates the target and propagates
  // inside that target's neighborhood.
  // ==================================================

  seedTwoedRules.push(
    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: centerNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_ACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: leftCenterAgent.id,

        signalType: "center_all_active_activate_side",

        signalPayload: {
          strength: 1,
          reason: "center_neighborhood_all_active",
        },

        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: centerNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_ACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: rightCenterAgent.id,

        signalType: "center_all_active_activate_side",

        signalPayload: {
          strength: 1,
          reason: "center_neighborhood_all_active",
        },

        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "center_all_active_activate_side",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "center_all_active_activate_side",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );

  // ==================================================
  // LEFT ALL ACTIVE
  //
  // LEFT → CENTER
  //
  // CENTER becomes inactive.
  // Autonomy is suspended for 2 minutes.
  // ==================================================

  seedTwoedRules.push(
    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: leftNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_ACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: centerAgent.id,

        signalType: "left_all_active_deactivate_center",

        signalPayload: {
          strength: 1,
          reason: "left_neighborhood_all_active",

          autonomy: {
            enabled: false,
            durationMs: 120000,
          },
        },

        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "left_all_active_deactivate_center",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "left_all_active_deactivate_center",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "left_all_active_deactivate_center",
      action: RULE_ACTIONS.UPDATE_AUTONOMY,
      threshold: 1,
    }),
  );

  // ==================================================
  // RIGHT ALL ACTIVE
  //
  // RIGHT → CENTER
  // ==================================================

  seedTwoedRules.push(
    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: rightNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_ACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: centerAgent.id,

        signalType: "right_all_active_deactivate_center",

        signalPayload: {
          strength: 1,
          reason: "right_neighborhood_all_active",

          autonomy: {
            enabled: false,
            durationMs: 120000,
          },
        },

        signalProperties: {
          propagationMode: "unicast",
          propagationScope: PROPAGATION_SCOPES.SPECIFIC,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "right_all_active_deactivate_center",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "right_all_active_deactivate_center",
      action: RULE_ACTIONS.UPDATE_AUTONOMY,
      threshold: 1,
    }),
  );

  // ==================================================
  // CENTER ALL INACTIVE
  //
  // CENTER → LEFT
  // CENTER → RIGHT
  //
  // Both sides become completely inactive.
  // ==================================================

  seedTwoedRules.push(
    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: centerNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_INACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: leftCenterAgent.id,

        signalType: "center_all_inactive_deactivate_side",

        signalPayload: {
          strength: 1,
          reason: "center_neighborhood_all_inactive",
        },

        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: centerNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_INACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: rightCenterAgent.id,

        signalType: "center_all_inactive_deactivate_side",

        signalPayload: {
          strength: 1,
          reason: "center_neighborhood_all_inactive",
        },

        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "center_all_inactive_deactivate_side",
      action: RULE_ACTIONS.INACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "center_all_inactive_deactivate_side",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );

  // ==================================================
  // LEFT ALL INACTIVE
  //
  // LEFT → CENTER
  //
  // Center becomes active and propagates through
  // its own neighborhood.
  // ==================================================

  seedTwoedRules.push(
    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: leftNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_INACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: centerAgent.id,

        signalType: "left_all_inactive_activate_center",

        signalPayload: {
          strength: 1,
          reason: "left_neighborhood_all_inactive",
        },

        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "left_all_inactive_activate_center",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "left_all_inactive_activate_center",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );

  // ==================================================
  // RIGHT ALL INACTIVE
  //
  // RIGHT → CENTER
  // ==================================================

  seedTwoedRules.push(
    await postRule(experimentId, {
      scope: "neighborhood",
      neighborhoodId: rightNeighborhood.id,

      trigger: {
        type: RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_INACTIVE,
      },

      action: RULE_ACTIONS.SEND_SIGNAL,

      appendedSignal: {
        delayMs: 0,
        targetAgentId: centerAgent.id,

        signalType: "right_all_inactive_activate_center",

        signalPayload: {
          strength: 1,
          reason: "right_neighborhood_all_inactive",
        },

        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      },
    }),

    await postRule(experimentId, {
      signalType: "right_all_inactive_activate_center",
      action: RULE_ACTIONS.ACTIVATE,
      threshold: 1,
    }),

    await postRule(experimentId, {
      signalType: "right_all_inactive_activate_center",
      action: RULE_ACTIONS.PROPAGATE,
      threshold: 1,
    }),
  );

  // ==================================================
  // OUTPUT
  // ==================================================

  console.log(
    `Added ${seedTwoedRules.length} rules to ${ruleSet.name}.`,
  );

  console.log(
    `Connected ${connections.connected} Neighborhoods`,
  );

  console.log("\n========== SECOND seedTwo COMPLETE ==========");
  console.log(`ExperimentRun: ${experimentId}`);

  console.log("\nNeighborhoods:");
  console.log(`LEFT:   ${leftNeighborhood.id}`);
  console.log(`CENTER: ${centerNeighborhood.id}`);
  console.log(`RIGHT:  ${rightNeighborhood.id}`);

  console.log("\nCenter Agents:");
  console.log(`LEFT:   ${leftCenterAgent.id}`);
  console.log(`CENTER: ${centerAgent.id}`);
  console.log(`RIGHT:  ${rightCenterAgent.id}`);
}
export const stateDefinitions = [
  { id: 1, name: "inactive" },
  { id: 2, name: "waiting" },
  { id: 3, name: "active" },
  { id: 4, name: "synchronized" },
  { id: 5, name: "triggered" }
];

export const signalDefinitions = [
  {
    id: 1,
    type: "pulse",
    description: "Basic activation signal"
  },
  {
    id: 2,
    type: "wave",
    description: "Propagating synchronization signal"
  },
  {
    id: 3,
    type: "alert",
    description: "Warning signal"
  },
  {
    id: 4,
    type: "sync",
    description: "Synchronize neighborhood"
  }
];

export const ruleDefinitions = [
  {
    id: 1,
    type: "threshold",
    description: "Trigger when signal strength reaches threshold"
  },
  {
    id: 2,
    type: "always",
    description: "Always execute"
  }
];

export const actionDefinitions = [
  {
    id: 1,
    name: "activate"
  },
  {
    id: 2,
    name: "propagate"
  },
  {
    id: 3,
    name: "block"
  },
  {
    id: 4,
    name: "sync"
  }
];

export const conditionDefinitions = [
  {
    id: 1,
    name: "threshold"
  },
  {
    id: 2,
    name: "equals"
  },
  {
    id: 3,
    name: "greaterThan"
  },
  {
    id: 4,
    name: "lessThan"
  }
];

export const store = {
  experimentRuns: [
    {
      id: "1",
      status: "running",

      agents: [],
      neighborhoods: [],
      rulesets: [],
      signals: [
    /*
    {
        id,
        type,
        sourceId,
        targetId,

        payload: {
            strength,
            color
        },

        properties: {
            ttl,
            hopCount,
            priority
        },

        timestamp,

        status,

        blocked
    }
    */
],
      states: [],
      stateHistory: [],
      propagationEvents: [],
      observationMetrics: []
    }
  ]
};
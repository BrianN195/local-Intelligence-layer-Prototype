export const stateDefinitions = [
  { id: 1, name: "inactive" },
  { id: 2, name: "waiting" },
  { id: 3, name: "active" },
  { id: 4, name: "synchronized" },
  { id: 5, name: "triggered" }
];


export const store = {
    experimentRuns: [
        {
            id: "1",
            status: "running",

            agents: [],
            neighborhoods: [],
            rulesets: [],
            signals: [],
            states: [],
            stateHistory: [],
            propagationEvents: [],
            observationMetrics: []
        }
    ]
}
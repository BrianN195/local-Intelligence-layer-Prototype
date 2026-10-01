# Local intelligenze entity Map

## Agent

    Represents a logical participant in a Local Intelligence experiment. An agent maintains internal state, participates in neighborhoods, sends and receives signals, and follows behavior rules. In most cases an agent will likely be associated with a device or participant session, but the exact mapping remains an open architectural question.

## AgentState

    Represents the current internal state of an agent during an experiment. Examples may include states such as inactive, waiting, listening, active, synchronized, or triggered. Historical state changes may be recorded separately through experiment logging and event tracking.

## Neighborhood

    Represents a collection of agents that belong to the same local interaction context. A neighborhood defines the potential scope of interaction but does not necessarily imply direct connections between all members.

## NeighborRelation

    Represents a direct local connection between two agents within a neighborhood. Neighbor relations define the paths through which signals and influence can propagate.

## Signal

    Signals may originate from experiment-level control mechanisms or from agent-to-agent interactions. Signals can influence agent behavior, trigger rules, and may propagate through neighbor relations depending on the experiment design.

## RuleSet

    Represents a collection of behavior rules that define how agents react to signals, neighboring agents, and local conditions during an experiment. Different RuleSets may be used to explore different collective behaviors such as synchronization, clustering, wave propagation, or swarm dynamics.

## Rule

    Represents a single behavioral rule that determines how an agent responds to specific inputs, conditions, or events. Rules may evaluate signals, agent states, neighborhood information, or other local factors and define the resulting agent behavior.

## Threshold

    Represents a boundary value or activation condition used by a rule. Thresholds may determine when a rule is triggered, such as requiring a minimum number of active neighbors or a minimum signal strength before an agent changes its behavior.

## ExperimentRun

    Represents a single execution of a Local Intelligence experiment. An ExperimentRun defines the context in which agents, neighborhoods, signals, rules, and observations are evaluated and recorded.

## PropagationEvent

    Represents the movement or transmission of a signal between agents within a network. Propagation events provide a record of how signals spread through neighborhoods and contribute to emergent collective behavior.

## ObservationMetric

    Represents a measurable property of an experiment used to observe and analyze collective behavior. Metrics may be used to evaluate phenomena such as synchronization, propagation speed, clustering, consensus formation, or other emergent patterns.

## CollectiveBehaviorResult

    Represents an observed outcome that emerges from the interactions of multiple agents during an experiment. Examples may include synchronization, wave propagation, clustering, consensus formation, swarm dynamics, or distributed musical interaction.

## Map
```
1 ExperimentRun
│
├── n Neighborhood
│       │
│       ├── n Agent
│       │      │
│       │      └── AgentState
│       │
│       └── NeighborRelation
│               │
│               ├── Agent
│               └── Agent
│
├── 1 RuleSet
│       │
│       └── n Rule
│               │
│               └── n Threshold
│
├── n ObservationMetric
│
└── n CollectiveBehaviorResult

Agent
│
└── Signal

Signal
│
├── PropagationEvent
│
└── Rule
        │
        └── AgentState
```
Open Question:
Should Signal be modeled as a single entity covering both experiment-level and agent-to-agent communication, or should these be represented separately?

## Signal Flow Examples
```
Agent
   ↓
Signal
   ↓
NeighborRelation
   ↓
Agent
   ↓
Rule
   ↓
AgentState

or

ExperimentRun
      ↓
Signal
      ↓
Neighborhood
      ↓
Agent
      ↓
Signal
      ↓
NeighborRelation
      ↓
Agent
      ↓
Rule
      ↓
AgentState
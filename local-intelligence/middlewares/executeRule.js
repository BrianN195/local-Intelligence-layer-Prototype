import { processSignal } from "../engine";

const actions = {
    activate,
    propagate,
    block,
    sync
};

export default function executeRule(rule, signal, run){

    const action = actions[rule.action];

    if(!action){
        console.log("Unknown Action");
        return;
    }

    return action(signal, run);
}

function activate(signal) {
  const agent = store.agents.find((a) => a.id === signal.targetId);

  if (!agent) return;

  const state = store.agentStates.find((s) => s.id === agent.stateId);

  if (!state) return;

  state.state = "active";
  state.updatedAt = new Date();
  //frage: warum nicht mit dem endpunkt zum updaten des agent states?
}

function block(signal) {
  signal.blocked = true;
  //im store gibts noch nichts bzgl signals, also aufbau, inhalt etc.
}

function propagate(signal, run) {
  processSignal(signal, run);
}

function sync(signal, run) {
  const agent = store.agents.find((a) => a.id === signal.targetAgentId);

  const neighborhood = store.neighborhoods.find(
    (n) => n.id === agent.neighborhoodId,
  );

  if (!neighborhood) return;

  for (const agentId of neighborhood.agentIds) {
    const agent = store.agents.find((a) => a.id === agentId);

    if (!agent) continue;

    const state = store.agentStates.find((s) => s.id === agent.stateId);

    if (!state) continue;

    state.state = "active";
    state.updatedAt = new Date();
  }
}

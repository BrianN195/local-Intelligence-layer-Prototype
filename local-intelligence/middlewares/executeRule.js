import { processSignal } from "../engine";

export default function executeRule(rule, signal, run) {

    switch (rule.action) {

        case "activate":
            activate(signal)
            console.log("Activate");

            break;

        case "propagate":
            propagate(signal, run)
            console.log("Propagate");

            break;

        case "block":
            block(signal)
            console.log("Blocked");

            break;

        case "sync":
            sync(signal)
            console.log("Synchronize");

            break;

        default:

            console.log("Unknown Action");
    }
}

function activate(signal) {

  const agent = store.agents.find(
    (a) => a.id === signal.targetId
  );

  if (!agent)
    return;

  const state = store.agentStates.find(
    (s) => s.id === agent.stateId
  );

  if (!state)
    return;

  state.state = "active";
  state.updatedAt = new Date();

};

function block(signal) {

  signal.blocked = true;

};

function propagate(signal, run) {

  processSignal(signal, run);

};

function sync(signal, run) {
    //sucht ne neighborhoodID und vergleicht sie mit der targetID, welche aber die ID von einem agent ist?
    //noch korrigieren
    const neighborhood = store.neighborhoods.find(
    (n) => n.id === signal.targetId
  );

  if (!neighborhood)
    return;

  for (const agentId of neighborhood.agentIds) {

    const agent = store.agents.find(
      (a) => a.id === agentId
    );

    if (!agent)
      continue;

    const state = store.agentStates.find(
      (s) => s.id === agent.stateId
    );

    if (!state)
      continue;

    state.state = "active";
    state.updatedAt = new Date();
  }

};
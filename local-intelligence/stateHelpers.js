import { stateDefinitions } from "./store.js";

export function getStateId(name) {
  return (
    stateDefinitions.find(
      (state) => state.name === name
    )?.id ?? 1
  );
}

export function getStateName(id) {
  return (
    stateDefinitions.find(
      (state) => state.id === id
    )?.name ?? "inactive"
  );
}
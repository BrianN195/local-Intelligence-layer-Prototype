export const STATE_NAMES = Object.freeze({
  INACTIVE: "inactive",
  WAITING: "waiting",
  ACTIVE: "active",
  SYNCHRONIZED: "synchronized",
  TRIGGERED: "triggered",
  OFFLINE: "offline",
  LISTENING: "listening",
});

export const AGENT_STATUS = Object.freeze({
  ONLINE: "online",
  OFFLINE: "offline",
});

export const SIGNAL_STATUS = Object.freeze({
  CREATED: "created",
  PROCESSING: "processing",
  PROPAGATED: "propagated",
  COMPLETED: "completed",
  BLOCKED: "blocked",
});

import {
  Agent,
  NeighborhoodRelation,
  Neighborhood,
  FailureState,
  ProtocolEvent,
} from "../models/index.js";

// distance
function calculateDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.position.x - b.position.x, 2) +
      Math.pow(a.position.y - b.position.y, 2),
  );
}

// direction
function directionDifference(a, b) {
  let diff = Math.abs(a.direction - b.direction);

  if (diff > 180) {
    diff = 360 - diff;
  }

  return diff;
}

//
function calculateScore(distance, angle) {
  return distance + angle * 0.5;
}

// bist replacement
export async function findReplacementAgent(failedAgentId) {
  const failedAgent = await Agent.findById(failedAgentId);

  if (!failedAgent) {
    throw new Error("Failed agent not found.");
  }

  const candidates = await Agent.find({
    status: "online",
    neighborhoodId: failedAgent.neighborhoodId,
    _id: { $ne: failedAgentId },
  });

  let best = null;
  let bestScore = Infinity;

  for (const agent of candidates) {
    if (!agent.position) continue;

    const distance = calculateDistance(failedAgent, agent);
    const angle = directionDifference(failedAgent, agent);
    const score = calculateScore(distance, angle);
    if (score < bestScore) {
      bestScore = score;
      best = agent;
    }
  }

  return best;
}

export async function replaceFailedAgent(failedAgentId) {
  const failedAgent = await Agent.findById(failedAgentId);

  if (!failedAgent) {
    throw new Error("Agent not found.");
  }

  const replacement = await findReplacementAgent(failedAgentId);

  await FailureState.create({
    agentId: failedAgent._id,
    experimentRunId: failedAgent.experimentRunId || null,
    reason: "Agent timeout. No heartbeat received.",
    status: "detected",
    metadata: {
      lastSeen: failedAgent.lastSeen,
      detectedAt: new Date(),
    },
  });

  await ProtocolEvent.create({
    type: "AGENT_FAILURE_DETECTED",
    category: "runtime",
    schemaVersion: "1.0",
    agentId: failedAgent._id,
    reason: "Agent considered offline after heartbeat timeout.",
    detail: {
      lastSeen: failedAgent.lastSeen,
      timeoutMs: 15000,
    },
  });

  if (!replacement) {
    failedAgent.status = "offline";
    await failedAgent.save();

    await ProtocolEvent.create({
      type: "AGENT_REPLACEMENT_FAILED",
      category: "runtime",
      schemaVersion: "1.0",
      agentId: failedAgent._id,
      reason: "No suitable replacement agent was found.",
    });
    
    await TechnicalWarning.create({
      experimentRunId: failedAgent.experimentRunId,
      category: "neighborhood",
      severity: "warning",
      code: "NO_REPLACEMENT_AGENT",
      message: "No replacement agent is available.",
      detail: {
        failedAgentId,
        neighborhoodId: failedAgent.neighborhoodId,
      },
    });

    return null;
  }

  await NeighborhoodRelation.updateMany(
    {
      sourceAgent: failedAgent._id,
    },
    {
      sourceAgent: replacement._id,
    },
  );

  await NeighborhoodRelation.updateMany(
    {
      targetAgent: failedAgent._id,
    },
    {
      targetAgent: replacement._id,
    },
  );

  await Neighborhood.updateOne(
    {
      _id: failedAgent.neighborhoodId,
    },
    {
      $pull: {
        agentIds: failedAgent._id,
      },
    },
  );

  await Neighborhood.updateOne(
    {
      _id: failedAgent.neighborhoodId,
    },
    {
      $addToSet: {
        agentIds: replacement._id,
      },
    },
  );

  failedAgent.status = "offline";
  await failedAgent.save();

  await ProtocolEvent.create({
    type: "AGENT_REPLACED",
    category: "runtime",
    schemaVersion: "1.0",
    agentId: replacement._id,
    reason: "Failed agent was replaced.",
    detail: {
      failedAgentId: failedAgent._id,
      replacementAgentId: replacement._id,
      neighborhoodId: failedAgent.neighborhoodId,
    },
  });

  return replacement;
}

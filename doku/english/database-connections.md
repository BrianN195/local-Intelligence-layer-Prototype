# Database connections

> **Status:** The examples below are earlier design sketches for a normalized MongoDB implementation; they are **not** the current API implementation. Local Intelligence currently persists complete `ExperimentRun` snapshots. See the [current architecture overview](architecture.md) and [run-persistence adapter](../../local-intelligence/services/runPersistence.js) for the implemented persistence path. In the current API, `row` and `col` must be supplied when creating an Agent. The sample below is historical and must not be treated as a current endpoint contract.

## Agents

### Register an Agent

```js
/* REGISTER AGENT */
router.post("/agents", async (req, res) => {
  try {
    const agent = await Agent.create({
      deviceId: req.body.deviceId,

      // Initial state
      stateId: null,

      // Agent is not assigned to a neighborhood yet
      neighborhoodId: null,

      // Position will be assigned later
      position: {
        row: req.body.row ?? null,
        col: req.body.col ?? null,
      },

      // Device information
      deviceInfo: {
        model: req.body.deviceInfo?.model ?? null,
        platform: req.body.deviceInfo?.platform ?? null,
        version: req.body.deviceInfo?.version ?? null,
      },

      direction: req.body.direction ?? 0,

      status: "online",

      lastSeen: new Date(),

      metadata: req.body.metadata ?? {},
    });

    res.status(201).json(agent);

  } catch (error) {
    // Duplicate deviceId
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Agent with this deviceId already exists",
      });
    }

    res.status(500).json({
      error: "Failed to register agent",
      details: error.message,
    });
  }
});
```

### Update an Agent's state

```js
router.patch("/agents/:id/state", async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        error: "Agent not found",
      });
    }

    const previousState = agent.stateId;

    agent.stateId = req.body.stateId;
    agent.lastSeen = new Date();

    await agent.save();

    res.json(agent);

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid agent ID",
      });
    }

    res.status(500).json({
      error: "Failed to update agent state",
      details: error.message,
    });
  }
});
```

The code examples intentionally retain their original normalized-model design. They are reference sketches, not evidence that these endpoints or per-Agent MongoDB documents are implemented in the current Local Intelligence API. For lifecycle policy and its implementation status, see the [data lifecycle policy](data-lifecycle-policy-v0.1.md).
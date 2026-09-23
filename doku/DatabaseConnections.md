# Database Connections

## Agents

### Register Agent

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

## Update Agent State

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

## 

```js

```








## 

```js

```
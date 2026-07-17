# Experiment Log – Single Pulse Signal Propagation

## Experiment Information

| Field | Value |
|-------|-------|
| Experiment ID | exp-1 |
| Status | inactive |
| Scenario | Single Pulse Signal |
| Initial Agents | 12 |
| Neighborhoods | 5 |
| Active Ruleset | rule-1 (pulse → boost) |

---

# Goal

Verify that a single **pulse** signal propagates through the connected neighborhood graph and activates downstream agents according to the active propagation rule.

---

# Initial Configuration

## Agents

- 12 registered agents (`phone-1` … `phone-12`)
- All agents started in **State 1**
- Agents distributed across five overlapping neighborhoods

## Neighborhood Layout

```
N1
phone-1
phone-2
phone-3
phone-4

        ↓ overlap

N2
phone-2
phone-3
phone-4
phone-5

        ↓ overlap

N3
phone-5
phone-6
phone-7
phone-8

        ↓ overlap

N4
phone-6
phone-7
phone-8
phone-9

        ↓ overlap

N5
phone-9
phone-10
phone-11
phone-12
```

---

# Active Rule

| Rule | Trigger | Action |
|------|---------|--------|
| rule-1 | pulse | boost |

---

# Test Procedure

1. Register all twelve agents.
2. Create overlapping neighborhoods.
3. Activate the ruleset.
4. Emit one **pulse** signal from **phone-1**.
5. Observe propagation events.
6. Record state changes.
7. Generate experiment summary.

---

# Propagation Sequence

The emitted pulse propagated sequentially through the connected topology.

| Step | Source | Target | Result |
|------|--------|--------|--------|
| 1 | phone-1 | phone-2 | Activated |
| 2 | phone-2 | phone-3 | Activated |
| 3 | phone-3 | phone-4 | Activated |
| 4 | phone-4 | phone-5 | Activated |
| 5 | phone-5 | phone-6 | Activated |
| 6 | phone-6 | phone-7 | Activated |
| 7 | phone-7 | phone-8 | Activated |
| 8 | phone-8 | phone-9 | Activated |
| 9 | phone-9 | phone-10 | Activated |
|10 | phone-10 | phone-11 | Activated |
|11 | phone-11 | phone-12 | Activated |

---

# State Changes

All registered agents began in **State 1**.

The pulse caused sequential transitions to **State 3**.

| Agent | State Before | State After |
|-------|--------------|-------------|
| phone-1 | 1 | 1 *(signal origin)* |
| phone-2 | 1 | 3 |
| phone-3 | 1 | 3 |
| phone-4 | 1 | 3 |
| phone-5 | 1 | 3 |
| phone-6 | 1 | 3 |
| phone-7 | 1 | 3 |
| phone-8 | 1 | 3 |
| phone-9 | 1 | 3 |
| phone-10 | 1 | 3 |
| phone-11 | 1 | 3 |
| phone-12 | 1 | 3 |

---

# Propagation Event Summary

- Total propagation events: **11**
- Successful events: **11**
- Failed events: **0**
- Rule activations: **11**
- Average delay: **0 ms**

Each propagation event successfully triggered **rule-1**, producing a boost and updating the receiving agent from State 1 to State 3.

---

# Observations

- Signal propagation followed the neighborhood connectivity.
- No propagation failures occurred.
- Every receiving agent transitioned successfully.
- The originating agent remained unchanged.
- State history matches the recorded propagation events.
- Rule execution was consistent across every hop.

---

# Experiment Summary

```JSON
{
    "id": "exp-1",
    "status": "inactive",
    "agents": [
        {
            "id": "33e56088-4025-47e2-8924-3c555d6395e5",
            "deviceId": "phone-1",
            "stateId": 1,
            "neighborhoodIds": [
                "0aa7ea46-1b3b-4914-8bb3-83f173e01ab1"
            ]
        },
        {
            "id": "495afc38-3145-4342-b630-ad1128c04993",
            "deviceId": "phone-2",
            "stateId": 3,
            "neighborhoodIds": [
                "0aa7ea46-1b3b-4914-8bb3-83f173e01ab1",
                "18696c5e-6f26-4760-b336-484c51f45262"
            ]
        },
        {
            "id": "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
            "deviceId": "phone-3",
            "stateId": 3,
            "neighborhoodIds": [
                "0aa7ea46-1b3b-4914-8bb3-83f173e01ab1",
                "18696c5e-6f26-4760-b336-484c51f45262"
            ]
        },
        {
            "id": "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
            "deviceId": "phone-4",
            "stateId": 3,
            "neighborhoodIds": [
                "0aa7ea46-1b3b-4914-8bb3-83f173e01ab1",
                "18696c5e-6f26-4760-b336-484c51f45262"
            ]
        },
        {
            "id": "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
            "deviceId": "phone-5",
            "stateId": 3,
            "neighborhoodIds": [
                "18696c5e-6f26-4760-b336-484c51f45262",
                "9a14c089-f54c-4ffd-8538-9338f13749e7"
            ]
        },
        {
            "id": "e5c7271b-685c-4f8f-83db-24c74dd32cab",
            "deviceId": "phone-6",
            "stateId": 3,
            "neighborhoodIds": [
                "9a14c089-f54c-4ffd-8538-9338f13749e7",
                "c76b5b4e-306c-4727-b548-5b79734fbf99"
            ]
        },
        {
            "id": "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
            "deviceId": "phone-7",
            "stateId": 3,
            "neighborhoodIds": [
                "9a14c089-f54c-4ffd-8538-9338f13749e7",
                "c76b5b4e-306c-4727-b548-5b79734fbf99"
            ]
        },
        {
            "id": "ad667cef-3c8f-46de-bf99-748a3d4c684e",
            "deviceId": "phone-8",
            "stateId": 3,
            "neighborhoodIds": [
                "9a14c089-f54c-4ffd-8538-9338f13749e7",
                "c76b5b4e-306c-4727-b548-5b79734fbf99"
            ]
        },
        {
            "id": "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
            "deviceId": "phone-9",
            "stateId": 3,
            "neighborhoodIds": [
                "c76b5b4e-306c-4727-b548-5b79734fbf99",
                "3c433c14-56f2-4a76-a1ac-a53ccf750ec4"
            ]
        },
        {
            "id": "b5b35716-6153-426f-82ba-b51344369874",
            "deviceId": "phone-10",
            "stateId": 3,
            "neighborhoodIds": [
                "3c433c14-56f2-4a76-a1ac-a53ccf750ec4"
            ]
        },
        {
            "id": "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
            "deviceId": "phone-11",
            "stateId": 3,
            "neighborhoodIds": [
                "3c433c14-56f2-4a76-a1ac-a53ccf750ec4"
            ]
        },
        {
            "id": "3ba4b626-0bdf-4526-b81f-ea992785c96b",
            "deviceId": "phone-12",
            "stateId": 3,
            "neighborhoodIds": [
                "3c433c14-56f2-4a76-a1ac-a53ccf750ec4"
            ]
        }
    ],
    "neighborhoods": [
        {
            "id": "0aa7ea46-1b3b-4914-8bb3-83f173e01ab1",
            "experimentRunId": "exp-1",
            "agentIds": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2"
            ]
        },
        {
            "id": "18696c5e-6f26-4760-b336-484c51f45262",
            "experimentRunId": "exp-1",
            "agentIds": [
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf"
            ]
        },
        {
            "id": "9a14c089-f54c-4ffd-8538-9338f13749e7",
            "experimentRunId": "exp-1",
            "agentIds": [
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
                "ad667cef-3c8f-46de-bf99-748a3d4c684e"
            ]
        },
        {
            "id": "c76b5b4e-306c-4727-b548-5b79734fbf99",
            "experimentRunId": "exp-1",
            "agentIds": [
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
                "ad667cef-3c8f-46de-bf99-748a3d4c684e",
                "674ca2e0-be3f-4a3d-b374-5928f2cd2f09"
            ]
        },
        {
            "id": "3c433c14-56f2-4a76-a1ac-a53ccf750ec4",
            "experimentRunId": "exp-1",
            "agentIds": [
                "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
                "b5b35716-6153-426f-82ba-b51344369874",
                "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
                "3ba4b626-0bdf-4526-b81f-ea992785c96b"
            ]
        }
    ],
    "rulesets": [
        {
            "id": "101f6646-71cd-4da1-a7cb-72d992fe6804",
            "rules": [
                {
                    "id": "rule-1",
                    "signalType": "pulse",
                    "action": "boost"
                }
            ],
            "active": true
        }
    ],
    "signals": [
        {
            "id": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "sourceId": "33e56088-4025-47e2-8924-3c555d6395e5",
            "targetId": "495afc38-3145-4342-b630-ad1128c04993",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993"
            ],
            "timestamp": "2026-07-15T12:22:45.520Z"
        },
        {
            "id": "31cd149d-d9c9-4f09-94d1-2e68f52c0aaa",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "495afc38-3145-4342-b630-ad1128c04993",
            "targetId": "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "9fa058e8-6592-4485-8510-058dad8abf01",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
            "targetId": "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "30fe5a45-3227-4042-908b-ee55af0281d4",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
            "targetId": "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "0fec3aa1-47da-4080-9e61-e6e78f5e7cfc",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
            "targetId": "e5c7271b-685c-4f8f-83db-24c74dd32cab",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "9ebd576f-56e8-4a41-a131-ec4e7b206068",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "e5c7271b-685c-4f8f-83db-24c74dd32cab",
            "targetId": "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "171f81f3-bb73-4a32-aa65-70be283374e6",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
            "targetId": "ad667cef-3c8f-46de-bf99-748a3d4c684e",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
                "ad667cef-3c8f-46de-bf99-748a3d4c684e"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "392d63c1-c408-428d-9cec-af96fbbdb163",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "ad667cef-3c8f-46de-bf99-748a3d4c684e",
            "targetId": "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
                "ad667cef-3c8f-46de-bf99-748a3d4c684e",
                "674ca2e0-be3f-4a3d-b374-5928f2cd2f09"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "113e8bdf-f886-44ea-b7ed-a4e965651908",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
            "targetId": "b5b35716-6153-426f-82ba-b51344369874",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
                "ad667cef-3c8f-46de-bf99-748a3d4c684e",
                "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
                "b5b35716-6153-426f-82ba-b51344369874"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "0b553192-fc50-49b3-9cd4-36b764f7ae8f",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "b5b35716-6153-426f-82ba-b51344369874",
            "targetId": "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
                "ad667cef-3c8f-46de-bf99-748a3d4c684e",
                "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
                "b5b35716-6153-426f-82ba-b51344369874",
                "0344ae64-87bb-459a-b2f6-7646a2b3ef86"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "2f4e6d3f-3396-4329-a1a8-c4494e6f9ad0",
            "experimentRunId": "exp-1",
            "type": "pulse",
            "parentSignalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
            "targetId": "3ba4b626-0bdf-4526-b81f-ea992785c96b",
            "visitedAgents": [
                "33e56088-4025-47e2-8924-3c555d6395e5",
                "495afc38-3145-4342-b630-ad1128c04993",
                "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
                "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
                "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
                "e5c7271b-685c-4f8f-83db-24c74dd32cab",
                "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
                "ad667cef-3c8f-46de-bf99-748a3d4c684e",
                "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
                "b5b35716-6153-426f-82ba-b51344369874",
                "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
                "3ba4b626-0bdf-4526-b81f-ea992785c96b"
            ],
            "payload": {
                "strength": 1
            },
            "timestamp": "2026-07-15T12:22:45.521Z"
        }
    ],
    "stateHistory": [
        {
            "id": "f36871e3-89fe-4ceb-b041-b9cc3b619c66",
            "agentId": "33e56088-4025-47e2-8924-3c555d6395e5",
            "deviceId": "phone-1",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.187Z",
            "reason": "agent_registered"
        },
        {
            "id": "f4da6c50-b752-469c-a203-33efaced1b08",
            "agentId": "495afc38-3145-4342-b630-ad1128c04993",
            "deviceId": "phone-2",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.213Z",
            "reason": "agent_registered"
        },
        {
            "id": "559c53ef-e8e8-4e58-b1fa-ea44e88445d2",
            "agentId": "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
            "deviceId": "phone-3",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.227Z",
            "reason": "agent_registered"
        },
        {
            "id": "dc67d3ed-92cf-4866-9c3d-fb5159cca656",
            "agentId": "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
            "deviceId": "phone-4",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.243Z",
            "reason": "agent_registered"
        },
        {
            "id": "6830c6c4-0b8a-4b00-bf27-911e73ce443a",
            "agentId": "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
            "deviceId": "phone-5",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.259Z",
            "reason": "agent_registered"
        },
        {
            "id": "4aa4b252-8b36-453b-bae2-31ced99dec52",
            "agentId": "e5c7271b-685c-4f8f-83db-24c74dd32cab",
            "deviceId": "phone-6",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.273Z",
            "reason": "agent_registered"
        },
        {
            "id": "23703477-bd1c-48ce-9ecc-31cebe94c81f",
            "agentId": "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
            "deviceId": "phone-7",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.289Z",
            "reason": "agent_registered"
        },
        {
            "id": "427c8917-220a-4515-bd05-4857c841fb77",
            "agentId": "ad667cef-3c8f-46de-bf99-748a3d4c684e",
            "deviceId": "phone-8",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.305Z",
            "reason": "agent_registered"
        },
        {
            "id": "6ec308ae-72bf-4f20-9110-a8b30aaa13d2",
            "agentId": "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
            "deviceId": "phone-9",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.321Z",
            "reason": "agent_registered"
        },
        {
            "id": "f8481068-2d46-48b9-ab7e-47e2224e6f5b",
            "agentId": "b5b35716-6153-426f-82ba-b51344369874",
            "deviceId": "phone-10",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.337Z",
            "reason": "agent_registered"
        },
        {
            "id": "49146664-ec08-4bba-8d86-45a80a604740",
            "agentId": "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
            "deviceId": "phone-11",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.354Z",
            "reason": "agent_registered"
        },
        {
            "id": "542d0d50-3a77-42f4-90a1-8a9d4a365b67",
            "agentId": "3ba4b626-0bdf-4526-b81f-ea992785c96b",
            "deviceId": "phone-12",
            "stateId": 1,
            "timestamp": "2026-07-15T12:22:45.369Z",
            "reason": "agent_registered"
        },
        {
            "id": "dc312311-365f-433a-9124-e2aab27a092b",
            "agentId": "495afc38-3145-4342-b630-ad1128c04993",
            "previousState": 1,
            "newState": 3,
            "signalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "timestamp": "2026-07-15T12:22:45.520Z"
        },
        {
            "id": "969e2343-5833-412c-bcf0-d005b1ff2986",
            "agentId": "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
            "previousState": 1,
            "newState": 3,
            "signalId": "31cd149d-d9c9-4f09-94d1-2e68f52c0aaa",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "32ea2f49-1dca-4429-aff9-1237ae4d6a6d",
            "agentId": "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
            "previousState": 1,
            "newState": 3,
            "signalId": "9fa058e8-6592-4485-8510-058dad8abf01",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "e8b5df28-6a04-46ed-90d4-d4dc4a0f4787",
            "agentId": "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
            "previousState": 1,
            "newState": 3,
            "signalId": "30fe5a45-3227-4042-908b-ee55af0281d4",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "114906e7-e79d-42e6-a171-021d5978b5da",
            "agentId": "e5c7271b-685c-4f8f-83db-24c74dd32cab",
            "previousState": 1,
            "newState": 3,
            "signalId": "0fec3aa1-47da-4080-9e61-e6e78f5e7cfc",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "3e9d3637-c5bc-4a9d-a5d6-c52fc4747acd",
            "agentId": "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
            "previousState": 1,
            "newState": 3,
            "signalId": "9ebd576f-56e8-4a41-a131-ec4e7b206068",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "0db70479-3a8a-48c2-8adc-79bc96d422af",
            "agentId": "ad667cef-3c8f-46de-bf99-748a3d4c684e",
            "previousState": 1,
            "newState": 3,
            "signalId": "171f81f3-bb73-4a32-aa65-70be283374e6",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "fba25e25-9c5f-431f-96e4-1a53012ad3a2",
            "agentId": "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
            "previousState": 1,
            "newState": 3,
            "signalId": "392d63c1-c408-428d-9cec-af96fbbdb163",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "24286b2b-a6e7-4f6d-a65f-36b3c662302c",
            "agentId": "b5b35716-6153-426f-82ba-b51344369874",
            "previousState": 1,
            "newState": 3,
            "signalId": "113e8bdf-f886-44ea-b7ed-a4e965651908",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "db8e8d64-bd88-4ae0-9337-d44cdb130c39",
            "agentId": "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
            "previousState": 1,
            "newState": 3,
            "signalId": "0b553192-fc50-49b3-9cd4-36b764f7ae8f",
            "timestamp": "2026-07-15T12:22:45.521Z"
        },
        {
            "id": "c7428ea2-7258-4df0-94c4-0e1acff1d792",
            "agentId": "3ba4b626-0bdf-4526-b81f-ea992785c96b",
            "previousState": 1,
            "newState": 3,
            "signalId": "2f4e6d3f-3396-4329-a1a8-c4494e6f9ad0",
            "timestamp": "2026-07-15T12:22:45.521Z"
        }
    ],
    "propagationEvents": [
        {
            "id": "5d443ac6-5d39-45c9-a8d8-2fac30f2748a",
            "experimentRunId": "exp-1",
            "signalId": "ddebd89a-2490-45f1-a4b6-3b6ce2194e20",
            "sourceId": "33e56088-4025-47e2-8924-3c555d6395e5",
            "targetId": "495afc38-3145-4342-b630-ad1128c04993",
            "signalType": "pulse",
            "signalStrength": 0,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "6dfcbbab-d4f1-4b89-af79-f743187a72ea",
            "experimentRunId": "exp-1",
            "signalId": "31cd149d-d9c9-4f09-94d1-2e68f52c0aaa",
            "sourceId": "495afc38-3145-4342-b630-ad1128c04993",
            "targetId": "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "9fba7333-848b-4621-8d94-dcfa55412492",
            "experimentRunId": "exp-1",
            "signalId": "9fa058e8-6592-4485-8510-058dad8abf01",
            "sourceId": "d5d6739b-c6c8-4a10-b9dc-14c0365aff6d",
            "targetId": "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "11a81542-9b69-4a65-8d4f-dcceaf2c12d3",
            "experimentRunId": "exp-1",
            "signalId": "30fe5a45-3227-4042-908b-ee55af0281d4",
            "sourceId": "ab447b01-74f3-48c0-be11-9e7edabd1ae2",
            "targetId": "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "6ba32ca7-865d-462c-acd4-a05f26d54414",
            "experimentRunId": "exp-1",
            "signalId": "0fec3aa1-47da-4080-9e61-e6e78f5e7cfc",
            "sourceId": "cf3e1427-8db4-48ac-8d97-c844f1fbb8cf",
            "targetId": "e5c7271b-685c-4f8f-83db-24c74dd32cab",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "afe08f2c-43af-4ec6-8243-774aa0f29086",
            "experimentRunId": "exp-1",
            "signalId": "9ebd576f-56e8-4a41-a131-ec4e7b206068",
            "sourceId": "e5c7271b-685c-4f8f-83db-24c74dd32cab",
            "targetId": "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "922fc048-5a40-48ea-bace-0b8a979300b2",
            "experimentRunId": "exp-1",
            "signalId": "171f81f3-bb73-4a32-aa65-70be283374e6",
            "sourceId": "84f7f037-ec9d-4621-b33d-ead6aeeaa487",
            "targetId": "ad667cef-3c8f-46de-bf99-748a3d4c684e",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "1ce8db4c-f624-448d-bae9-3ce526dfd5d5",
            "experimentRunId": "exp-1",
            "signalId": "392d63c1-c408-428d-9cec-af96fbbdb163",
            "sourceId": "ad667cef-3c8f-46de-bf99-748a3d4c684e",
            "targetId": "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "b45115cc-14a4-4a4f-8d2f-50a744874553",
            "experimentRunId": "exp-1",
            "signalId": "113e8bdf-f886-44ea-b7ed-a4e965651908",
            "sourceId": "674ca2e0-be3f-4a3d-b374-5928f2cd2f09",
            "targetId": "b5b35716-6153-426f-82ba-b51344369874",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "b70a2c1b-3679-4fb2-96f0-16732a60b5ae",
            "experimentRunId": "exp-1",
            "signalId": "0b553192-fc50-49b3-9cd4-36b764f7ae8f",
            "sourceId": "b5b35716-6153-426f-82ba-b51344369874",
            "targetId": "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        },
        {
            "id": "581d1d6f-2bad-456f-9704-f0cb2a088cb8",
            "experimentRunId": "exp-1",
            "signalId": "2f4e6d3f-3396-4329-a1a8-c4494e6f9ad0",
            "sourceId": "0344ae64-87bb-459a-b2f6-7646a2b3ef86",
            "targetId": "3ba4b626-0bdf-4526-b81f-ea992785c96b",
            "signalType": "pulse",
            "signalStrength": 1,
            "timestamp": "2026-07-15T12:22:45.521Z",
            "status": "success",
            "delayMs": 0,
            "localStateBefore": 1,
            "localStateAfter": 3,
            "ruleTriggered": "rule-1"
        }
    ],
    "observationMetrics": [
        {
            "id": "ab94d8d8-ee36-41fa-8c82-b33c92a1b687",
            "experimentRunId": "exp-1",
            "type": "activation-density",
            "value": 0.9166666666666666,
            "timestamp": "2026-07-15T12:22:45.554Z"
        },
        {
            "id": "7bdceb5d-42af-4c98-a1bc-4fffc7f3ef4b",
            "experimentRunId": "exp-1",
            "type": "signal-propagation",
            "value": 11,
            "timestamp": "2026-07-15T12:22:45.554Z"
        },
        {
            "id": "8c38ceb1-5673-4060-a8e5-7f38f7746ab4",
            "experimentRunId": "exp-1",
            "type": "synchronization",
            "value": 0.9166666666666666,
            "timestamp": "2026-07-15T12:22:45.554Z"
        },
        {
            "id": "30865a9c-3b54-4853-98e7-075dae8606ba",
            "experimentRunId": "exp-1",
            "type": "clustering",
            "value": 0,
            "timestamp": "2026-07-15T12:22:45.554Z"
        },
        {
            "id": "c2e049dd-dd6a-44f8-8b17-fa37e15db43f",
            "experimentRunId": "exp-1",
            "type": "consensus",
            "value": 1,
            "timestamp": "2026-07-15T12:22:45.554Z"
        }
    ],
    "collectiveBehaviorResults": [
        {
            "id": "989a4552-dc81-4f00-8938-c3999c9cc289",
            "experimentRunId": "exp-1",
            "type": "local-activity",
            "score": 0,
            "confidence": 1,
            "endTime": "2026-07-15T12:22:45.533Z",
            "summary": "Only local interactions occurred."
        }
    ]
}
```

---

# Conclusion

The experiment successfully demonstrated sequential pulse propagation through the complete neighborhood chain.

A single emitted pulse was sufficient to activate every reachable downstream agent. All propagation events completed successfully, each triggering **rule-1**, resulting in consistent state transitions from **State 1** to **State 3** while preserving the originating agent's state.
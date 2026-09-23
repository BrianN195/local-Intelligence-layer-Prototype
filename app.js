const API_URL = "http://localhost:3000";

const EXPERIMENT_RUN_ID = "experiment-9x9-test";

let globalGridRows = 9;
let globalGridCols = 9;
let localGridRows = 3;
let localGridCols = 3;

// =========================
// DOM ELEMENTS
// =========================

const visualization = document.getElementById("visualization");

const refreshButton = document.getElementById("refresh-button");

const signalForm = document.getElementById("signal-form");

const sourceAgentSelect = document.getElementById("source-agent");

const targetAgentSelect = document.getElementById("target-agent");

const signalStatus = document.getElementById("signal-status");

const connectionStatus = document.getElementById("connection-status");

const stateForm = document.getElementById("state-form");

const stateAgentSelect = document.getElementById("state-agent");

const agentStateSelect = document.getElementById("agent-state");

const stateStatus = document.getElementById("state-status");

const autonomyForm = document.getElementById("autonomy-form");

const autonomyStatus = document.getElementById("autonomy-status");

const actionForm = document.getElementById("action-form");

const actionAgentSelect = document.getElementById("action-agent");

const agentActionSelect = document.getElementById("agent-action");

const actionStrengthInput = document.getElementById("action-strength");

const actionScopeSelect = document.getElementById("action-scope");

const actionModeSelect = document.getElementById("action-mode");

const actionTtlInput = document.getElementById("action-ttl");

const actionStatus = document.getElementById("action-status");

const ruleForm = document.getElementById("rule-form");

const ruleStatus = document.getElementById("rule-status");

const ruleAgentSelect = document.getElementById("rule-agent");

const ruleNeighborhoodSelect = document.getElementById("rule-neighborhood");

const clearStatusButton = document.getElementById("clear-status-button");

const layoutForm = document.getElementById("layout-form");

const layoutStatus = document.getElementById("layout-status");

const fillGridButton = document.getElementById("fill-grid-button");

const ruleTriggerTypeSelect = document.getElementById("rule-trigger-type");

const appendedSignalFields = document.getElementById("appended-signal-fields");

let agents = [];
let neighborhoods = [];
// =========================
// STATE DEFINITIONS
// =========================

const stateNames = {
  1: "inactive",
  2: "waiting",
  3: "active",
  4: "synchronized",
  5: "triggered",
  6: "offline",
  7: "listening",
};

// =========================
// LOAD DATA
// =========================

async function loadData() {
  try {
    setConnectionStatus("Connecting...");

    agents = await fetchAgents();
    neighborhoods = await fetchNeighborhoods();
    const layout = await fetchLayout();

    updateGridInfo(neighborhoods, layout);

    updateStatistics(agents, neighborhoods);

    updateAgentSelects(agents);

    updateNeighborhoodSelect(neighborhoods);

    await updateRuleInfo();

      document.getElementById("data-updated").textContent =
        `Updated ${new Date().toLocaleTimeString()}`;

    renderGrid();

    setConnectionStatus("Connected");
  } catch (error) {
    console.error("Failed to load data:", error);

    setConnectionStatus("Could not connect to the backend");
  }
}

// =========================
// FETCH AGENTS
// =========================

async function fetchAgents() {
  const response = await fetch(
    `${API_URL}/agents?experimentRunId=${EXPERIMENT_RUN_ID}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch agents: ${response.status}`);
  }

  return response.json();
}

// =========================
// FETCH NEIGHBORHOODS
// =========================

async function fetchNeighborhoods() {
  const response = await fetch(
    `${API_URL}/neighborhoods?experimentRunId=${EXPERIMENT_RUN_ID}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch neighborhoods: ${response.status}`);
  }

  return response.json();
}

async function fetchLayout() {
  const response = await fetch(
    `${API_URL}/experiment-runs/${EXPERIMENT_RUN_ID}/layout`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch layout: ${response.status}`);
  }

  return response.json();
}

async function fetchRules() {
  const response = await fetch(
    `${API_URL}/rules/${EXPERIMENT_RUN_ID}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }

    throw new Error(`Failed to fetch rules: ${response.status}`);
  }

  return response.json();
}

// =========================
// STATISTICS
// =========================

function updateStatistics(agents, neighborhoods) {
  const active = agents.filter((agent) => agent.stateId === 3).length;

  const inactive = agents.filter((agent) => agent.stateId === 1).length;

  document.getElementById("agent-count").textContent = agents.length;

  document.getElementById("active-count").textContent = active;

  document.getElementById("inactive-count").textContent = inactive;

  document.getElementById("neighborhood-count").textContent =
    neighborhoods.length;
}

function updateGridInfo(neighborhoodList, layout = {}) {
  const boundedNeighborhoods = neighborhoodList.filter(
    (neighborhood) => neighborhood.bounds,
  );

  globalGridRows = Number(layout.globalRows) || boundedNeighborhoods.reduce(
    (max, neighborhood) => Math.max(max, neighborhood.bounds.rowEnd),
    0,
  ) || 9;
  globalGridCols = Number(layout.globalCols) || boundedNeighborhoods.reduce(
    (max, neighborhood) => Math.max(max, neighborhood.bounds.colEnd),
    0,
  ) || 9;
  localGridRows = Number(layout.localRows) || 3;
  localGridCols = Number(layout.localCols) || 3;

  document.getElementById("global-rows").value = globalGridRows;
  document.getElementById("global-cols").value = globalGridCols;
  document.getElementById("local-rows").value = localGridRows;
  document.getElementById("local-cols").value = localGridCols;

  const localSizes = boundedNeighborhoods.map((neighborhood) => {
    const bounds = neighborhood.bounds;
    return `${bounds.rowEnd - bounds.rowStart + 1} x ${bounds.colEnd - bounds.colStart + 1}`;
  });

  const uniqueLocalSizes = [...new Set(localSizes.length ? localSizes : [`${localGridRows} x ${localGridCols}`])];

  document.getElementById("grid-description").textContent =
    `${globalGridRows} x ${globalGridCols} global / ${localGridRows} x ${localGridCols} local neighborhoods`;
}

async function updateRuleInfo() {
  try {
    const rules = await fetchRules();
    const activeRules = rules.filter((rule) => rule.enabled !== false);

    document.getElementById("rule-count").textContent = activeRules.length;
    document.getElementById("rule-detail").textContent =
      `${rules.length} rule(s) loaded`;
  } catch (error) {
    document.getElementById("rule-count").textContent = "-";
    document.getElementById("rule-detail").textContent = "RuleSet unavailable";
  }
}

// =========================
// AGENT SELECTS
// =========================

function updateAgentSelects(agents) {
  sourceAgentSelect.innerHTML = `
        <option value="">
            Select agent
        </option>
    `;

  targetAgentSelect.innerHTML = `
        <option value="">
            None
        </option>
    `;

  stateAgentSelect.innerHTML = `
    <option value="">
        Select agent
    </option>
    `;

  actionAgentSelect.innerHTML = '<option value="">Select agent</option>';
  ruleAgentSelect.innerHTML = '<option value="">Agent scope only</option>';
  document.getElementById("appended-target").innerHTML = '<option value="">Select target</option>';

  for (const agent of agents) {
    const state = stateNames[agent.stateId] || "unknown";

    const shortId = agent.id.substring(0, 8);

    const label = `${shortId}... (${state})`;

    const sourceOption = document.createElement("option");

    sourceOption.value = agent.id;

    sourceOption.textContent = label;

    sourceAgentSelect.appendChild(sourceOption);

    const targetOption = document.createElement("option");

    targetOption.value = agent.id;

    targetOption.textContent = label;

    targetAgentSelect.appendChild(targetOption);

    const stateOption = document.createElement("option");

    stateOption.value = agent.id;

    stateOption.textContent = `${agent.id.substring(0, 8)}... (${stateNames[agent.stateId] || "unknown"})`;

    stateAgentSelect.appendChild(stateOption);

    const actionOption = document.createElement("option");

    actionOption.value = agent.id;

    actionOption.textContent = `${agent.deviceId} (${stateNames[agent.stateId] || "unknown"})`;

    actionAgentSelect.appendChild(actionOption);

    const ruleAgentOption = document.createElement("option");
    ruleAgentOption.value = agent.id;
    ruleAgentOption.textContent = label;
    ruleAgentSelect.appendChild(ruleAgentOption);

    const appendedTargetOption = document.createElement("option");
    appendedTargetOption.value = agent.id;
    appendedTargetOption.textContent = label;
    document.getElementById("appended-target").appendChild(appendedTargetOption);
  }
}

function updateNeighborhoodSelect(neighborhoodList) {
  ruleNeighborhoodSelect.innerHTML =
    '<option value="">Only for neighborhood scope</option>';

  for (const neighborhood of neighborhoodList) {
    const option = document.createElement("option");
    option.value = neighborhood.id;
    option.textContent = neighborhood.name || neighborhood.id.slice(0, 8);
    ruleNeighborhoodSelect.appendChild(option);
  }
}

// =========================
// RENDER 9x9 GRID
// =========================

function renderGrid() {
  const grid = document.getElementById("visualization");

  if (!grid) {
    console.error('Element with id="visualization" not found.');
    return;
  }

  grid.innerHTML = "";

  // =========================
  // CREATE 9x9 GRID
  // =========================

  grid.style.gridTemplateColumns = `repeat(${globalGridCols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${globalGridRows}, 1fr)`;

  for (let row = 1; row <= globalGridRows; row++) {
    for (let col = 1; col <= globalGridCols; col++) {
      // -------------------------
      // Create grid cell
      // -------------------------

      const cell = document.createElement("div");

      cell.classList.add("grid-cell");

      // =========================
      // FIND NEIGHBORHOOD
      // =========================

      const neighborhood = neighborhoods.find((n) => {
        if (!n.bounds) {
          return false;
        }

        return (
          row >= n.bounds.rowStart &&
          row <= n.bounds.rowEnd &&
          col >= n.bounds.colStart &&
          col <= n.bounds.colEnd
        );
      });

      let agent = null;

      // =========================
      // FIND AGENT
      // =========================

      if (neighborhood) {
        /*
         * The agent position is LOCAL
         * to the neighborhood (1-3).
         *
         * Convert global 9x9 position
         * into local 3x3 position.
         */

        const localRow = row - neighborhood.bounds.rowStart + 1;

        const localCol = col - neighborhood.bounds.colStart + 1;

        agent = agents.find(
          (a) =>
            a.neighborhoodId === neighborhood.id &&
            a.position &&
            a.position.row === localRow &&
            a.position.col === localCol,
        );
      }

      // =========================
      // CREATE AGENT
      // =========================

      if (agent) {
        const agentElement = document.createElement("div");

        agentElement.classList.add("agent");

        // State 3 = active
        if (agent.stateId === 1) {
          agentElement.classList.add("inactive");
        } else if (agent.stateId === 2) {
          agentElement.classList.add("waiting");
        } else if (agent.stateId === 3) {
          agentElement.classList.add("active");
        } else if (agent.stateId === 7) {
          agentElement.classList.add("listening");
        }

        // Agent information on hover

        agentElement.title =
          `Agent: ${agent.deviceId}\n` +
          `State: ${stateNames[agent.stateId] || "unknown"}\n` +
          `Position: ${agent.position.row}, ${agent.position.col}`;

        cell.appendChild(agentElement);
      }

      // =========================
      // NEIGHBORHOOD BORDERS
      // =========================

      if (neighborhood) {
        const bounds = neighborhood.bounds;

        if (row === bounds.rowStart) {
          cell.classList.add("neighborhood-top");
        }

        if (row === bounds.rowEnd) {
          cell.classList.add("neighborhood-bottom");
        }

        if (col === bounds.colStart) {
          cell.classList.add("neighborhood-left");
        }

        if (col === bounds.colEnd) {
          cell.classList.add("neighborhood-right");
        }
      }

      // =========================
      // ADD CELL TO GRID
      // =========================

      grid.appendChild(cell);
    }
  }
}

// =========================
// SEND SIGNAL
// =========================

async function sendSignal(event) {
  event.preventDefault();

  signalStatus.textContent = "Sending...";

  signalStatus.className = "";

  try {
    const type = document.getElementById("signal-type").value.trim();

    const sourceAgentId = sourceAgentSelect.value;

    const targetAgentId = targetAgentSelect.value || null;

    const ttl = Number(document.getElementById("signal-ttl").value);

    const propagationMode = document.getElementById("propagation-mode").value;

    const propagationScope = document.getElementById("propagation-scope").value;

    const propagationDirection =
      document.getElementById("propagation-direction").value || null;

    const payloadText = document.getElementById("signal-payload").value.trim();

    let payload = {};

    if (payloadText) {
      try {
        payload = JSON.parse(payloadText);
      } catch {
        throw new Error("Payload must contain valid JSON.");
      }
    }

    const signalData = {
      experimentRunId: EXPERIMENT_RUN_ID,

      type,

      sourceAgentId,

      targetAgentId,

      payload,

      properties: {
        ttl,

        hopCount: 0,

        propagationMode,

        propagationDirection,

        propagationScope,
      },
    };

    console.log("Sending signal:", signalData);

    const response = await fetch(`${API_URL}/signals`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(signalData),
    });

    if (!response.ok) {
      let errorMessage = `Failed to send signal: ${response.status}`;

      try {
        const errorData = await response.json();

        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Response was not JSON
      }

      throw new Error(errorMessage);
    }

    const signal = await response.json();

    console.log("Signal created:", signal);

    signalStatus.textContent = "Signal sent";

    signalStatus.className = "success";

    /*
     * Reload the data after sending.
     *
     * If signal propagation changes
     * agent states, the visualization
     * will show the new state.
     */

    await loadData();
  } catch (error) {
    console.error("Failed to send signal:", error);

    signalStatus.textContent = error.message;

    signalStatus.className = "error";
  }
}

// =========================
// STATUS
// =========================

function setConnectionStatus(status) {
  connectionStatus.textContent = status;
}

async function changeAgentState(event) {
  event.preventDefault();

  stateStatus.textContent = "Updating...";

  stateStatus.className = "";

  try {
    const agentId = stateAgentSelect.value;

    const stateId = Number(agentStateSelect.value);

    const reason = document.getElementById("state-reason").value.trim();

    if (!agentId) {
      throw new Error("Please select an agent.");
    }

    if (!stateId) {
      throw new Error("Please select a state.");
    }

    const response = await fetch(`${API_URL}/agents/${agentId}/state`, {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        experimentRunId: EXPERIMENT_RUN_ID,

        stateId,

        reason: reason || "manual_update",
      }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to change state: ${response.status}`;

      try {
        const errorData = await response.json();

        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Response was not JSON
      }

      throw new Error(errorMessage);
    }

    const updatedAgent = await response.json();

    console.log("Agent state updated:", updatedAgent);

    stateStatus.textContent = `State changed to ${
      stateNames[updatedAgent.stateId]
    }`;

    stateStatus.className = "success";

    // Reload agents, statistics and grid

    await loadData();
  } catch (error) {
    console.error("Failed to change agent state:", error);

    stateStatus.textContent = error.message;

    stateStatus.className = "error";
  }
}

async function runAutonomyTicks(event) {
  event.preventDefault();

  autonomyStatus.textContent = "Running...";

  autonomyStatus.className = "";

  try {
    const tickCount = Number(document.getElementById("tick-count").value);

    if (!Number.isInteger(tickCount) || tickCount < 1 || tickCount > 100) {
      throw new Error("Tick count must be between 1 and 100.");
    }

    const response = await fetch(
      `${API_URL}/experiment-runs/${EXPERIMENT_RUN_ID}/simulation/ticks`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          tickCount,
        }),
      },
    );

    if (!response.ok) {
      let errorMessage = `Failed to run autonomy ticks: ${response.status}`;

      try {
        const errorData = await response.json();

        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Response was not JSON
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();

    console.log("Autonomy ticks:", result);

    autonomyStatus.textContent = `${result.tickCount} tick(s) executed`;

    autonomyStatus.className = "success";

    // Reload agents and update visualization

    await loadData();
  } catch (error) {
    console.error("Failed to run autonomy ticks:", error);

    autonomyStatus.textContent = error.message;

    autonomyStatus.className = "error";
  }
}

async function triggerAgentAction(event) {
  event.preventDefault();

  actionStatus.textContent = "Triggering...";

  actionStatus.className = "";

  try {
    const agentId = actionAgentSelect.value;

    const action = agentActionSelect.value;

    const strength = Number(actionStrengthInput.value);

    const propagationScope = actionScopeSelect.value;

    const propagationMode = actionModeSelect.value;

    const ttl = Number(actionTtlInput.value);

    if (!agentId) {
      throw new Error("Please select an agent.");
    }

    if (!action) {
      throw new Error("Please select an action.");
    }

    if (!Number.isFinite(strength) || strength < 0) {
      throw new Error("Signal strength must be bigger than 0.");
    }

    if (!Number.isInteger(ttl) || ttl < 0) {
      throw new Error("TTL must be a positive integer or 0.");
    }

    const response = await fetch(`${API_URL}/agents/${agentId}/actions`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        experimentRunId: EXPERIMENT_RUN_ID,

        action,

        strength,

        propagationScope,

        propagationMode,

        ttl,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to trigger action: ${response.status}`;

      try {
        const errorData = await response.json();

        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Response was not JSON
      }

      throw new Error(errorMessage);
    }

    const signal = await response.json();

    console.log("Agent action signal:", signal);

    actionStatus.textContent = `${action} triggered`;

    actionStatus.className = "success";

    await loadData();
  } catch (error) {
    console.error("Failed to trigger agent action:", error);

    actionStatus.textContent = error.message;

    actionStatus.className = "error";
  }
}

async function addSignalRule(event) {
  event.preventDefault();

  ruleStatus.textContent = "Adding...";
  ruleStatus.className = "";

  try {
    const scope = document.getElementById("rule-scope").value;
    const thresholdValue = document.getElementById("rule-threshold").value;
    const triggerType = ruleTriggerTypeSelect.value;
    const rule = {
      action: document.getElementById("rule-action").value,
      scope,
    };

    if (triggerType === "signal_received") {
      rule.signalType = document.getElementById("rule-signal-type").value.trim();
      rule.threshold = thresholdValue === "" ? null : Number(thresholdValue);
    } else {
      rule.trigger = {
        type: "state_changed",
        fromState: document.getElementById("rule-from-state").value || undefined,
        toState: document.getElementById("rule-to-state").value || undefined,
      };
      rule.appendedSignal = {
        delayMs: Number(document.getElementById("appended-delay").value),
        targetAgentId: document.getElementById("appended-target").value,
        signalType: document.getElementById("appended-type").value.trim(),
        signalPayload: { strength: 1 },
        signalProperties: {
          propagationMode: "broadcast",
          propagationScope: document.getElementById("appended-scope").value,
        },
      };
    }

    if (scope === "agent") {
      rule.agentId = ruleAgentSelect.value;
    }

    if (scope === "neighborhood") {
      rule.neighborhoodId = ruleNeighborhoodSelect.value;
    }

    if (triggerType === "signal_received" && !rule.signalType) {
      throw new Error("Signal type is required.");
    }

    if (triggerType === "state_changed" && (!rule.appendedSignal.targetAgentId || !rule.appendedSignal.signalType)) {
      throw new Error("Select a target and signal type for the appended signal.");
    }

    if (scope === "agent" && !rule.agentId) {
      throw new Error("Select an agent for agent scope.");
    }

    if (scope === "neighborhood" && !rule.neighborhoodId) {
      throw new Error("Select a neighborhood for neighborhood scope.");
    }

    const response = await fetch(`${API_URL}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experimentRunId: EXPERIMENT_RUN_ID,
        rule,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to add rule: ${response.status}`);
    }

    ruleStatus.textContent = "Rule added";
    ruleStatus.className = "success";
    await updateRuleInfo();
  } catch (error) {
    ruleStatus.textContent = error.message;
    ruleStatus.className = "error";
  }
}

async function updateLayout(event) {
  event.preventDefault();
  layoutStatus.textContent = "Applying...";
  layoutStatus.className = "status-line";

  try {
    const layout = {
      globalRows: Number(document.getElementById("global-rows").value),
      globalCols: Number(document.getElementById("global-cols").value),
      localRows: Number(document.getElementById("local-rows").value),
      localCols: Number(document.getElementById("local-cols").value),
    };

    const response = await fetch(`${API_URL}/experiment-runs/${EXPERIMENT_RUN_ID}/layout`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layout),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Layout failed: ${response.status}`);

    layoutStatus.textContent = "Layout applied";
    layoutStatus.className = "status-line success";
    await loadData();
  } catch (error) {
    layoutStatus.textContent = error.message;
    layoutStatus.className = "status-line error";
  }
}

async function fillGrid() {
  layoutStatus.textContent = "Filling slots...";
  layoutStatus.className = "status-line";

  try {
    const response = await fetch(
      `${API_URL}/experiment-runs/${EXPERIMENT_RUN_ID}/layout/fill`,
      { method: "POST" },
    );
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || `Fill failed: ${response.status}`);
    }

    layoutStatus.textContent =
      `${result.agentCount} agents / ${result.slotCount} slots (${result.createdCount} created)`;
    layoutStatus.className = "status-line success";
    await loadData();
  } catch (error) {
    layoutStatus.textContent = error.message;
    layoutStatus.className = "status-line error";
  }
}

function updateRuleFormVisibility() {
  const stateTrigger = ruleTriggerTypeSelect.value === "state_changed";
  document.querySelectorAll(".state-trigger-field").forEach((field) => field.style.display = stateTrigger ? "grid" : "none");
  document.querySelectorAll(".signal-rule-field").forEach((field) => field.style.display = stateTrigger ? "none" : "grid");
  appendedSignalFields.classList.toggle("visible", stateTrigger);
  document.getElementById("rule-action").value = stateTrigger ? "send_signal" : "activate";
}

function clearMessages() {
  [signalStatus, stateStatus, autonomyStatus, actionStatus, ruleStatus].forEach(
    (element) => {
      element.textContent = "";
      element.className = "";
    },
  );
}
// =========================
// EVENTS
// =========================

refreshButton.addEventListener("click", loadData);

clearStatusButton.addEventListener("click", clearMessages);

signalForm.addEventListener("submit", sendSignal);

stateForm.addEventListener("submit", changeAgentState);

autonomyForm.addEventListener("submit", runAutonomyTicks);

actionForm.addEventListener("submit", triggerAgentAction);

ruleForm.addEventListener("submit", addSignalRule);

layoutForm.addEventListener("submit", updateLayout);

fillGridButton.addEventListener("click", fillGrid);

ruleTriggerTypeSelect.addEventListener("change", updateRuleFormVisibility);
// =========================
// INITIAL LOAD
// =========================

updateRuleFormVisibility();
loadData();

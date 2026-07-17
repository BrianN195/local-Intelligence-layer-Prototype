const API = "http://localhost:3000";


async function post(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();

    throw new Error(
      `${res.status}: ${error}`
    );
  }

  return await res.json();
}


async function seed() {

  const experimentId = "experiment-9x9-test";


  // 1. Create ExperimentRun
  const experiment = await post(
    `/experiment-runs/${experimentId}`,
    {}
  );


  console.log(
    `Created ExperimentRun: ${experiment.id}`
  );


  const neighborhoods = [];
  const agents = [];


  // 2. Create 9 Neighborhoods
  for (let n = 1; n <= 9; n++) {

    const neighborhood = await post(
      "/neighborhoods",
      {
        experimentRunId: experimentId,
      }
    );


    neighborhoods.push(neighborhood);


    console.log(
      `Created Neighborhood ${n}: ${neighborhood.id}`
    );


    // 3. Create 9 Agents per Neighborhood
    for (let a = 1; a <= 9; a++) {

      const agent = await post(
        "/agents",
        {
          experimentRunId: experimentId,
          deviceId: `device-${n}-${a}`,
        }
      );


      agents.push(agent);


      // 4. Add Agent to Neighborhood
      await post(
        `/neighborhoods/${neighborhood.id}/agents`,
        {
          experimentRunId: experimentId,
          agentId: agent.id,
        }
      );
    }
  }


  console.log("\n========== SEED COMPLETE ==========");

  console.log(
    `ExperimentRun: ${experimentId}`
  );

  console.log(
    `Neighborhoods created: ${neighborhoods.length}`
  );

  console.log(
    `Agents created: ${agents.length}`
  );

  console.log(
    "\nFirst Agent:"
  );

  console.log(
    agents[0]
  );

  console.log(
    "\nFirst Neighborhood:"
  );

  console.log(
    neighborhoods[0]
  );
}


seed()
  .catch(error => {
    console.error(
      "\nSeed failed:"
    );

    console.error(
      error.message
    );
  });
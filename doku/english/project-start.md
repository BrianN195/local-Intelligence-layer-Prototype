# Starting Local Intelligence

This guide describes how to run the prototype locally with MongoDB.

## Prerequisites

- Node.js 20.19.0 or later and npm
- Docker with the dedicated MongoDB container `mon-mongo`, or your own MongoDB instance on port 27017
- Local ports 27017 and 3000 available

The existing `crowds-mongodb` container belongs to the Crowds system. This guide does **not** start, stop, or modify it. Local Intelligence uses `mon-mongo` and its own MongoDB database, `local_intelligence`.

## Install and start the backend

From the repository root:

```bash
cd local-intelligence
npm install
```

The local `.env` file contains the connection string `mongodb://127.0.0.1:27017/local_intelligence`. For a fresh checkout, copy `.env.example` to `.env` and adjust the values if needed. `.env` contains local configuration and is excluded from Git.

Start only the dedicated MongoDB container:

```bash
docker start mon-mongo
```

If `mon-mongo` does not exist, you can instead start a new container with its own persistent volume:

```bash
docker run -d --name local-intelligence-mongo --restart unless-stopped -p 27017:27017 -v local-intelligence-mongo-data:/data/db mongo:7
```

Then, from the `local-intelligence` directory:

```bash
npm start
```

The server first waits for the database and then restores saved runs. On successful startup, the console displays `MongoDB connected` and `Local Intelligence running on port 3000`. If MongoDB is unreachable, the API server does not start. Stop the server with **Ctrl+C**; runs are saved again before shutdown.

Alternatively, start it from the repository root:

```bash
node local-intelligence/app.js
```

## Example data

The supplied local `.env` sets `SEED_DEMO=true`. At startup, the server checks whether the example experiment run `experiment-9x9-test` exists. Only if it is missing is it created through the local API. Repeated starts therefore do not create the example data again. To run without example data, set `SEED_DEMO=false`. `seedScript2.js` is not run automatically.

Example API requests:

```text
GET http://localhost:3000/experiment-runs/experiment-9x9-test/summary
GET http://localhost:3000/agents?experimentRunId=experiment-9x9-test
GET http://localhost:3000/neighborhoods?experimentRunId=experiment-9x9-test
```

The `script1.html` and `script2.html` interfaces in the repository root expect the API at `http://localhost:3000`.

Run the integration test with MongoDB reachable:

```bash
npm test
```

The test uses a separate database with the `_test` suffix and deletes its test document when finished.

## Persistence scope and limits

The existing simulation logic processes an `ExperimentRun` synchronously as an object. To make this prototype database-backed with minimal risk, Local Intelligence saves each complete run as a snapshot in a MongoDB document in `experimentruns`, using the existing string ID. On startup, snapshots are loaded back into the runtime cache. API changes are saved before JSON responses and also periodically.

The current runtime does not yet persist agents, neighborhoods, signals, histories, propagation events, or metrics in normalized collections. The design supports **one backend server process per database**. Each run snapshot is limited to approximately 14 MiB of JSON; larger runs receive an error when saved. For production use or larger experiments, growing signals, histories, propagation events, and metrics should be moved into their own collections, and multi-process operation must be made safe. These are future architectural steps, not prerequisites for local handover operation.

## Troubleshooting

- **MongoDB connection failed:** Check `docker ps`, port 27017 availability, and `MONGODB_URI` in `.env`. Do not use `crowds-mongodb` as a substitute.
- **Port 3000 is in use:** Stop the competing process or change `PORT` in `.env`.
- **Port 27017 is in use:** Use `docker ps` to see whether another MongoDB container is using the host port. Do not modify the Crowds container; configure a separate available MongoDB port and update `MONGODB_URI`.
- **Dependencies are missing:** Run `npm install` in the `local-intelligence` directory.
- **Seeding failed:** Check the server console and confirm that port 3000 is available. The example run is created only if it does not already exist.

For details about the current persistence design, see [MongoDB Persistence Handover](mongodb-persistence-handover.md) and the [repository documentation](../../local-intelligence/repositories/README.md).

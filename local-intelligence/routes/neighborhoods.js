import express from "express";
import {
  addAgentsToNeighborhood,
  connectNeighborhoods,
  createNeighborhood,
  getNeighborhoods,
  getNeighborhoodLayout,
  fillNeighborhoodSlots,
  removeAgentFromNeighborhood,
  updateNeighborhoodLayout,
} from "../controllers/neighborhoodController.js";

const router = express.Router();

router.get("/neighborhoods", getNeighborhoods);
router.get("/experiment-runs/:id/layout", getNeighborhoodLayout);
router.post("/neighborhoods", createNeighborhood);
router.patch("/experiment-runs/:id/layout", updateNeighborhoodLayout);
router.post("/experiment-runs/:id/layout/fill", fillNeighborhoodSlots);
router.post("/neighborhoods/:id/agents", addAgentsToNeighborhood);
router.post("/neighborhoods/connect", connectNeighborhoods);
router.delete(
  "/neighborhoods/:id/agents/:agentId",
  removeAgentFromNeighborhood,
);

export default router;
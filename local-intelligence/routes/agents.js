import express from "express";
import { agentAction, createAgent, getAgents, updateAgentState } from "../controllers/agentController.js";

const router = express.Router();

router.get("/agents", getAgents);
router.post("/agents", createAgent);
router.patch("/agents/:id/state", updateAgentState);
router.post("/agents/:id/actions", agentAction);

export default router;

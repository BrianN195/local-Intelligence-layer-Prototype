import express from "express";
import { agentAction, createAgent, getAgents, updateAgentState } from "../controllers/agentController.js";

const router = express.Router();
//Get Agents is only for visual on index.html at the moment
/* GET AGENTS */
router.get("/agents", (req, res) => {
  getAgents(req, res)
});

/* REGISTER AGENT */
router.post("/agents",(req, res) => {
  return createAgent(req, res)
});
/* UPDATE AGENT STATE */
// frontend can create a button where a teilnehmer can set his state on inactive
router.patch("/agents/:id/state", (req, res) => {
  return updateAgentState(req, res)
});
/*  AGENT ACTION */
router.post("/agents/:id/actions", (req, res) => {
  return agentAction(req, res)
});
export default router;

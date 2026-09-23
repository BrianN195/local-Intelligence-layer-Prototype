import express from "express";
import {
  createRule,
  deleteRule,
  evaluateRules,
  getRules,
  setRuleEnabled,
  updateRule,
} from "../controllers/ruleController.js";

const router = express.Router();

/* ====================================================
   DEBUG RULE EVALUATION
==================================================== */
router.post("/rules/evaluate", evaluateRules);
router.post("/rules", createRule);
router.get("/rules/:experimentRunId", getRules);
router.patch("/rules/:id", updateRule);
router.delete("/rules/:id", deleteRule);
router.patch("/rules/:id/enabled", setRuleEnabled);

export default router;

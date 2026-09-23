import express from "express";
import { createRuleset } from "../controllers/rulesetController.js";

const router = express.Router();

/* ====================================================
Assign Rule Set
==================================================== */
router.post("/rulesets", createRuleset);

export default router;

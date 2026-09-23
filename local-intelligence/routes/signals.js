import express from "express";
import { createSignalFromRequest } from "../controllers/signalController.js";


const router = express.Router();

/* ====================================================
   SEND SIGNAL
==================================================== */
router.post("/signals", createSignalFromRequest);

export default router;

import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { getPaymentBreakdown, getStats } from "../controllers/statsController.js";

// Router object
const router = express.Router();

// Routes 
router.get("/stats", requireSignIn, isAdmin, getStats);
router.get("/payment-breakdown", requireSignIn, isAdmin, getPaymentBreakdown);

export default router;

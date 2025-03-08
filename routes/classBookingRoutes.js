

import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import { bookClass, cancelClassBooking } from "../controllers/classBookingController.js";

// Router object
const router = express.Router();

// Routes
router.post("/", requireSignIn, bookClass);
router.post("/cancel", requireSignIn, cancelClassBooking);

export default router;

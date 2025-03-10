

import express from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import { bookClass, cancelClassBooking, getClassForUser } from "../controllers/classBookingController.js";

// Router object
const router = express.Router();

// Routes
router.post("/", requireSignIn, bookClass);
router.post("/cancel", requireSignIn, cancelClassBooking);
router.get("/my-class", requireSignIn, getClassForUser);

export default router;

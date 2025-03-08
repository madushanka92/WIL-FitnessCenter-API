import express from "express";
import {
  addTestimonialController,
  getTestimonialsController,
} from "../controllers/testimonialController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to submit a testimonial (Protected Route)
router.post("/add-testimonial", requireSignIn, addTestimonialController);
router.get("/view-testimonial", getTestimonialsController);

export default router;

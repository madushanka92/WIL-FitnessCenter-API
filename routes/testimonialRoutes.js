import express from "express";
import {
  addTestimonialController,
  getTestimonialsController,
  getUserTestimonialsController,
} from "../controllers/testimonialController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Submit a testimonial (Protected Route)
router.post("/add-testimonial", requireSignIn, addTestimonialController);

// ✅ Fetch all approved testimonials (Public)
router.get("/view-testimonial", getTestimonialsController);

// ✅ Fetch only the logged-in user's testimonials (Protected)
router.get(
  "/view-user-testimonials",
  requireSignIn,
  getUserTestimonialsController
);

export default router;

import express from "express";
import {
  getTestimonialsController,
  getTestimonialController,
  updateTestimonialController,
  approveTestimonialController,
  deleteTestimonialController,
} from "../controllers/adminManageTestimonials.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Routes for Testimonials
// All routes below are protected by the isAdmin middleware

// Get all testimonials
router.get(
  "/displayTestimonials",
  requireSignIn,
  isAdmin,
  getTestimonialsController
);

// Get a single testimonial by ID
router.get("/:id", requireSignIn, isAdmin, getTestimonialController);

// Update a testimonial by ID
router.put("/:id", requireSignIn, isAdmin, updateTestimonialController);

// Approve a testimonial by ID
router.patch(
  "/:id/approve",
  requireSignIn,
  isAdmin,
  approveTestimonialController
);

// Delete a testimonial by ID
router.delete("/:id", requireSignIn, isAdmin, deleteTestimonialController);

export default router;

import express from "express";
import {
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  applyPromotion,
  createPromotion,
} from "../controllers/promotionController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new promotion (Admin only)
router.post("/create", requireSignIn, isAdmin, createPromotion);

// Get all promotions
router.get("/displayPromotions", getAllPromotions);

// Get a single promotion by ID
router.get("/:id", getPromotionById);

// Update a promotion (Admin only)
router.put("/:id", requireSignIn, isAdmin, updatePromotion);

// Delete a promotion (Admin only)
router.delete("/:id", requireSignIn, isAdmin, deletePromotion);

// Apply a promotion code
router.post("/apply", requireSignIn, applyPromotion);

export default router;

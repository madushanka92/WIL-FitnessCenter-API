import express from "express";
import { 
    createPromotion, 
    getPromotions, 
    getPromotionById, 
    updatePromotion, 
    deletePromotion 
} from "../controllers/promotionController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js"; // Protect routes

const router = express.Router();

router.post("/",  isAdmin, requireSignIn , createPromotion); // Create
router.get("/",  isAdmin, requireSignIn , getPromotions); // Get all
router.get("/:id",  isAdmin, requireSignIn , getPromotionById); // Get single
router.put("/:id",  isAdmin, requireSignIn , updatePromotion); // Update
router.delete("/:id",  isAdmin, requireSignIn , deletePromotion); // Delete

export default router;

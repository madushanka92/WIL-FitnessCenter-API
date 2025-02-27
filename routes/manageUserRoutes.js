import express from "express";
import { getAllUsers, getUserForTrainer } from "../controllers/userController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireSignIn, isAdmin, getAllUsers);
router.get('/for-trainer', requireSignIn, isAdmin, getUserForTrainer);

export default router;

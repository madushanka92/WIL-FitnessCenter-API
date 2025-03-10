import express from "express";
import {
    getUserById,
    updateUserData,
} from "../controllers/userController.js";
import { requireSignIn, } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/:id", requireSignIn, updateUserData);
router.get("/:id", requireSignIn, getUserById);

export default router;
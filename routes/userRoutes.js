import express from "express";
import {
    getUserById,
    getUserVerificationToken,
    updateUserData,
} from "../controllers/userController.js";
import { requireSignIn, } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/:id", requireSignIn, updateUserData);
router.get("/:id", requireSignIn, getUserById);
router.get("/verification-token/:email", getUserVerificationToken);

export default router;
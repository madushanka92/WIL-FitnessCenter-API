import express from "express";
import {
    updateUserData,
} from "../controllers/userController.js";
import { requireSignIn, } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/:id", requireSignIn, updateUserData);

export default router;
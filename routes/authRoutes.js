import express from "express";
import {
  registerController,
  loginController,
  testController,
  verifyEmailController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

// Router object
const router = express.Router();

// Routes
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/verify-email/:token", verifyEmailController);
router.get("/test", requireSignIn, isAdmin, testController);

export default router;

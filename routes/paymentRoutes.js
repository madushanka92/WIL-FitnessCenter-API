import express from "express";
import {
  createPayment,
  getPaymentsForUser,
  updateMembershipPayment
} from "../controllers/paymentContoller.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

// Router object
const router = express.Router();

// Routes
router.post("/", requireSignIn, createPayment);
router.post("/membership", requireSignIn, updateMembershipPayment);
router.get("/for-user", requireSignIn, getPaymentsForUser);

// router.post("/login", loginController);
// router.get("/verify-email/:token", verifyEmailController);
// router.get("/test", requireSignIn, isAdmin, testController);
// router.get('/resend-verify-email/:token', resendVerificationEmailController);
// router.post("/refresh-token", refreshTokenController);

export default router;

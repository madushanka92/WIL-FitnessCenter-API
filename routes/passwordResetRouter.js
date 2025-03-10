import express from "express";
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;

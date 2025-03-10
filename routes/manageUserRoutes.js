import express from "express";
import {
  getAllUsers,
  getUserForTrainer,
  //passwordReset,
  removeUser,
} from "../controllers/userController.js";
import { adminPasswordReset } from "../controllers/adminPasswordResetController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import { updateMembership } from "../controllers/membershipController.js";
import { updateUserMembership } from "../controllers/userController.js";

const router = express.Router();

router.get("/viewUsers", requireSignIn, isAdmin, getAllUsers);
router.get("/for-trainer", requireSignIn, isAdmin, getUserForTrainer);
router.delete("/:id", requireSignIn, isAdmin, removeUser);
router.post("/password-reset", requireSignIn, isAdmin, adminPasswordReset);
router.put("/update-membership", requireSignIn, isAdmin, updateUserMembership);

export default router;

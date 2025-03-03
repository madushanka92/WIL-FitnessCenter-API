import express from "express";
import {
  getAllUsers, getUserForTrainer,
  passwordReset,
  removeUser,
} from "../controllers/userController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireSignIn, isAdmin, getAllUsers);
router.get('/for-trainer', requireSignIn, isAdmin, getUserForTrainer);
router.delete("/:id", requireSignIn, isAdmin, removeUser);
router.post("/password-reset", requireSignIn, isAdmin, passwordReset);

export default router;

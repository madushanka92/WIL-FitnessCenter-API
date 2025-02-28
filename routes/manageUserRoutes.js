import express from "express";
import {
  getAllUsers,
  passwordReset,
  removeUser,
} from "../controllers/userController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireSignIn, isAdmin, getAllUsers);
router.delete("/:id", requireSignIn, isAdmin, removeUser);
router.post("/password-reset", requireSignIn, isAdmin, passwordReset);
export default router;

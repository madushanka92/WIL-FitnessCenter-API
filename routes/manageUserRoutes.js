import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireSignIn, isAdmin, getAllUsers);

export default router;

import express from "express";
import {
  createMembership,
  getAllMemberships,
  updateMembership,
  deleteMembership,
} from "../controllers/membershipController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Define routes
router.post("/create", requireSignIn, isAdmin, createMembership);
router.get("/all", getAllMemberships);
router.put("/update/:id", requireSignIn, isAdmin, updateMembership);
router.delete("/delete/:id", requireSignIn, isAdmin, deleteMembership);

export default router;

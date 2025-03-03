import express from "express";
import {
  createMembership,
  getAllMemberships,
  updateMembership,
  deleteMembership,
} from "../controllers/membershipController.js";

const router = express.Router();

// Define routes
router.post("/create", createMembership);
router.get("/all", getAllMemberships);
router.put("/update/:id", updateMembership);
router.delete("/delete/:id", deleteMembership);

export default router;

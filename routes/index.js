import express from "express";
import User from "../models/User.js";

const router = express.Router();

// router.use('/users', userRoutes);

//TEST PURPOSE---------------------------------
router.get("/test", (req, res) => {
  res.send("Test API is running...");
});
//---------------------------------------------

export default router;

import express from "express";
import User from "../models/User.js";
import userRoleRoutes from './userRoleRoutes.js';

const router = express.Router();

// router.use('/users', userRoutes);

//TEST PURPOSE---------------------------------
router.get("/test", (req, res) => {
  res.send("Test API is running...");
});
//---------------------------------------------


router.use('/user-roles', userRoleRoutes);

export default router;

import express from "express";
import User from "../models/User.js";
import userRoleRoutes from './userRoleRoutes.js';
import authRoutes from "./authRoutes.js";
import passwordResetRouter from "./passwordResetRouter.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/password", passwordResetRouter);

//TEST PURPOSE---------------------------------
router.get("/test", (req, res) => {
  res.send("Test API is running...");
});
//---------------------------------------------


router.use('/user-roles', userRoleRoutes);

export default router;

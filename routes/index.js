import express from "express";
import User from "../models/User.js";
import userRoleRoutes from "./userRoleRoutes.js";
import authRoutes from "./authRoutes.js";
import passwordResetRouter from "./passwordResetRouter.js";
import manageUserRoutes from "./manageUserRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/password", passwordResetRouter);

//TEST PURPOSE---------------------------------
router.get("/test", (req, res) => {
  res.send("Test API is running...");
});
//---------------------------------------------

router.use("/user-roles", userRoleRoutes);
router.use("/admin", manageUserRoutes);
//router.use("/admin/removeUser", manageUserRoutes);

export default router;

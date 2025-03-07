import express from "express";
import User from "../models/User.js";
import userRoleRoutes from "./userRoleRoutes.js";
import authRoutes from "./authRoutes.js";
import passwordResetRouter from "./passwordResetRouter.js";
import trainerRoutes from "./trainerRoutes.js";
import manageUserRoutes from "./manageUserRoutes.js";
import promotionRoutes from "./promotionRoutes.js";
import membershipRoutes from "./membershipRoutes.js";
import classRoutes from "./classRoutes.js";
import blogpostRoutes from "./blogpostRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/password", passwordResetRouter);

//TEST PURPOSE---------------------------------
router.get("/test", (req, res) => {
  res.send("Test API is running...");
});
//---------------------------------------------


router.use('/user-roles', userRoleRoutes);
router.use('/trainers', trainerRoutes);
router.use("/user-roles", userRoleRoutes);
router.use("/displayusers", manageUserRoutes);
router.use("/promotion", promotionRoutes);
router.use("/admin", manageUserRoutes);
router.use("/memberships", membershipRoutes);
router.use("/class", classRoutes);
router.use("/blogPost", blogpostRoutes);
router.use("/payment", paymentRoutes);

export default router;
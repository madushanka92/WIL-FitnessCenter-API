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
import testimonialRoutes from "./testimonialRoutes.js";
import manageTestimonialRoutes from "./manageTestimonialRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import bloglikesRoutes from "./bloglikesRoutes.js";
import blogcommentRoutes from "./blogcommentRoutes.js";
import userRoutes from "./userRoutes.js";
import classBookingRoutes from "./classBookingRoutes.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerConfig.js";
import path from "path";
import fs from "fs";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/password", passwordResetRouter);

//TEST PURPOSE---------------------------------
router.get("/test", (req, res) => {
  res.send("Test API is running...");
});
//---------------------------------------------

router.use("/user-roles", userRoleRoutes);
router.use("/trainers", trainerRoutes);
router.use("/user-roles", userRoleRoutes);
router.use("/displayusers", manageUserRoutes);
router.use("/promotion", promotionRoutes);
router.use("/admin", manageUserRoutes);
router.use("/memberships", membershipRoutes);
router.use("/class", classRoutes);
router.use("/blogPost", blogpostRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/manageTestimonials", manageTestimonialRoutes);
router.use("/payment", paymentRoutes);
router.use("/blogLikes", bloglikesRoutes);
router.use("/blogComment", blogcommentRoutes);
router.use("/user", userRoutes);
router.use("/class-booking", classBookingRoutes);

// Direct Image Uploader from Blog Post editor
router.post('/upload-image', requireSignIn, isAdmin, upload.single('image'), (req, res) => {
  const port = process.env.PORT || 3000;
  const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`
  res.json({ url: imageUrl })
})

router.delete('/delete-image', requireSignIn, isAdmin, (req, res) => {
  const { url } = req.body
  const imagePath = path.join(process.cwd(), url)

  // Delete the image from the server
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('Error deleting image:', err)
      return res.status(500).send('Error deleting image')
    }
    res.send('Image deleted successfully')
  })
})

export default router;

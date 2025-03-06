import User from "../models/User.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../helpers/emailHelper.js";

/**
 * Admin Password Reset Controller
 */
export const adminPasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password_hash = hashedPassword;
    await user.save();

    // Notify the user via email
    const emailSubject = "Your Password Has Been Reset by Admin";
    const emailText = `Hello ${user.first_name},\n\nYour account password has been reset by the administrator. If you requested this change, you can now log in using your new password.

If you did not request a password reset, please contact our support team immediately to secure your account.\n\n Support Contact: admin@fitnthrive.com \n\n Best regards, \nSupport Team

`;
    await sendEmail(user.email, emailSubject, emailText);

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Email sent to user.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ success: false, message: "Error resetting password." });
  }
};

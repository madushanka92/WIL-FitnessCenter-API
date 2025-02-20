import User from "../models/User.js";
import JWT from "jsonwebtoken";
import { hashPassword } from "../helpers/authHelper.js";
import nodemailer from "nodemailer";
import SecretKeys from "../secret_key.js";

const sendGridApiKey = SecretKeys.PASSKEY; // SendGrid API key
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net", // SendGrid SMTP host
  port: 587, // SMTP port
  auth: {
    user: "apikey", // Use 'apikey' as the username
    pass: sendGridApiKey,
  },
});

// Request Password Reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate Reset Token (valid for 1 hour)
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Store the reset token
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Reset Link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`; //!!!!!!!!!! change frontend url in .env
    const resetToken = `${token}`;
    console.log(`Password Reset Token: ${resetToken}`); // Debugging

    // Send Email
    const mailOptions = {
      from: "melbin.study@gmail.com", // Sender Mail
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.error("Password Reset Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Error requesting password reset",
      error,
    });
  }
};
// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Verify Token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update Password
    user.password_hash = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error resetting password", error });
  }
};

import User from "../models/User.js";
import JWT from "jsonwebtoken";
import { hashPassword } from "../helpers/authHelper.js";
import nodemailer from "nodemailer";
import SecretKeys from "../secret_key.js";

// Configure SendGrid SMTP Transport
const sendGridApiKey = SecretKeys.PASSKEY; // SendGrid API key
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: sendGridApiKey,
  },
});

/**
 * Handles user password reset request by generating a reset token
 * and sending a reset email with a reset link.
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate a password reset token valid for 1 hour
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Store the reset token and expiration time in the database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Expires in 1 hour
    await user.save();

    // Construct the password reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    console.log(`Password Reset Token: ${token}`); // Debugging purpose

    // Define email options for sending the reset email
    const mailOptions = {
      from: "melbin.study@gmail.com", // Sender email address
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link below to reset your password:
      
      ${resetLink}
      
      This link expires in 1 hour.`,
    };

    // Send the password reset email
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

/**
 * Handles resetting a user's password after verifying the reset token.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // Get token from request parameters
    const { newPassword } = req.body; // Get new password from request body

    // Validate input parameters
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Token and new password are required",
        });
    }

    // Verify the reset token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    // Validate the token and check expiration
    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // Hash the new password and update user record
    user.password_hash = await hashPassword(newPassword);
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined; // Clear token expiration
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

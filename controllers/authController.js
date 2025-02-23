import User from "../models/User.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SecretKeys from "../secret_key.js";
import { sendEmail } from "../helpers/emailHelper.js";

dotenv.config();

// Configure SendGrid transporter
const sendGridApiKey = SecretKeys.EMAILKEY;
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: sendGridApiKey,
  },
});

/**
 * Register Controller with Email Verification
 * Handles user registration, hashing passwords, storing user data,
 * generating verification tokens, and sending verification emails.
 */
export const registerController = async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, phone_number } = req.body;

    if (!first_name || !last_name || !email || !password_hash || !phone_number) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    // Hash password and generate token
    const hashedPassword = await hashPassword(password_hash);
    const verificationToken = JWT.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Save new user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      phone_number,
      verificationToken,
      verificationTokenExpires: Date.now() + 3600000,
    });

    await newUser.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(email, "Verify Your Email", `Click the link to verify:\n\n${verificationLink}`);

    res.status(201).json({
      success: true,
      message: "User registered. Check email for verification link.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Error registering user", error });
  }
};


/**
 * Email Verification Controller
 * Verifies a user's email using a token sent via email.
 */
export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification token" });
    }

    // Decode the token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res
      .status(400)
      .json({
        success: false,
        message: "Invalid User !!!",
      });

    // Check if user exists and token is valid
    if (
      !user ||
      user.verificationToken !== token ||
      user.verificationTokenExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification token",
        });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Email verified successfully. You can now log in.",
      });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying email", error });
  }
};

/**
 * Login Controller
 * Authenticates a user, checks email verification status, and issues JWT token.
 */
export const loginController = async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    if (!email || !password_hash) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Please verify your email before logging in",
        });
    }

    // Compare passwords
    const match = await comparePassword(password_hash, user.password_hash);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error logging in", error });
  }
};

/**
 * Test Controller
 * Simple endpoint for testing protected routes.
 */
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

/**
 * Resend Email Verification Token
 */
export const resendVerificationEmailController = async (req, res) => {
  try {
    const { token } = req.params;

    let userEmail = undefined;

    if (token) {
      const decoded = JWT.decode(token);
      userEmail = decoded.email;
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    // Generate new verification token
    const newVerificationToken = JWT.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Update user with new token
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpires = Date.now() + 3600000;
    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${newVerificationToken}`;
    await sendEmail(user.email, "Resend: Verify Your Email", `Click the link to verify:\n\n${verificationLink}`);

    res.status(200).json({ success: true, message: "New verification email sent." });
  } catch (error) {
    console.error("Resend Email Error:", error);
    res.status(500).json({ success: false, message: "Error resending email", error });
  }
};


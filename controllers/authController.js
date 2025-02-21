import User from "../models/User.js";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SecretKeys from "../secret_key.js";
import UserRole from "../models/UserRole.js";

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
    const { first_name, last_name, email, password_hash, phone_number, user_role } =
      req.body;

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password_hash ||
      !phone_number
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already registered" });
    }

    // Fetch the default 'member' role if user_role is not provided
    let role_id = user_role;
    if (!user_role) {
      const defaultRole = await UserRole.findOne({ role: "member" });
      if (!defaultRole) {
        return res.status(500).json({ success: false, message: "Default 'member' role not found" });
      }
      role_id = defaultRole._id;
    }

    // Hash the user's password
    const hashedPassword = await hashPassword(password_hash);

    // Generate email verification token
    const verificationToken = JWT.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create new user record
    const newUser = new User({
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      phone_number,
      role_id, // Assigning the role
      verificationToken,
      verificationTokenExpires: Date.now() + 3600000, // Token expiry in 1 hour
    });

    // Generate verification link
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Email options for verification
    const mailOptions = {
      from: "melbin.study@gmail.com",
      to: email,
      subject: "Verify Your Email",
      text: `Please click the link below to verify your email:\n\n${verificationLink}\n\nThis link expires in 1 hour.`,
    };

    // Send verification email
    await transporter.sendMail(mailOptions);

    // Save new user in database
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered. Check email for verification link.",
      token: verificationToken,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error registering user", error });
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

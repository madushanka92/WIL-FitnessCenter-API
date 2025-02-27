import JWT from "jsonwebtoken";
import userModel from "../models/User.js";

// Protected route token base
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(" ")[1];

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    // Check if the authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing.",
      });
    }

    // Verify the JWT token from the authorization header
    const decoded = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );

    // Attach the decoded user data to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in requireSignIn middleware:", error);

    // Return a 401 response for unauthorized access or token issues
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Accessing admin view
export const isAdmin = async (req, res, next) => {
  try {

    // Retrieve the user from the database using the user ID attached in the request
    const user = await userModel.findById(req.user._id).populate('role_id');

    // Check if the user exists
    if (!user || user.role_id?.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Ensure the user has a valid role_id before comparing
    if (!user.role_id) {
      return res.status(400).json({
        success: false,
        message: "User role is not defined.",
      });
    }

    // Check if the user's role_id matches the admin role ID
    const ADMIN_ROLE_ID = "67b7a46a7e12ffc35848ee8f"; // The admin role ID
    if (user.role_id.toString() !== ADMIN_ROLE_ID) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Admin privileges required.",
      });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);

    // Handle server errors
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

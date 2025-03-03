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

    // Verify the JWT token from the authorization header
    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    // Check if the authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing.",
      });
    }

    // Attach the decoded user data to the request object
    req.user = decode;

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

// Admin access control
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).populate("role_id");
    if (!user || user.role_id?.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Unauthorized Access!",
      });
    }
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error in Admin Middleware",
    });
  }
};

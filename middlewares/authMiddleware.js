import JWT from "jsonwebtoken";
import userModel from "../models/User.js";

// Protected route token-based authentication
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res
      .status(401)
      .send({ success: false, message: "Invalid or Expired Token" });
  }
};

// Admin access control
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== "admin") {
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

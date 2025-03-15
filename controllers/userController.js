import User from "../models/User.js";
import Membership from "../models/Membership.js";
import bcrypt from "bcrypt";

//-------------------------DISPLAY USERS--------------------------------------------
export const getAllUsers = async (req, res) => {
  try {
    // Get page and limit from query parameters, with defaults
    const { page = 1, limit = 10 } = req.query;

    // Calculate the number of records to skip based on the current page
    const skip = (page - 1) * limit;

    // Fetch paginated users
    const users = await User.find()
      .select("_id first_name last_name email phone_number membership_id") // Select specific fields
      .populate({
        path: "role_id",
        select: "-_id role isActive", // Select role and isActive fields from UserRole
        match: { role: { $ne: "admin" } }, // Exclude users with the role "admin"
      })
      .skip(skip) // Skip records based on the page number
      .limit(Number(limit)); // Limit the number of records returned

    // Filter out users with a null role_id (null role happens when excluding admin)
    const filteredUsers = users.filter((user) => user.role_id !== null);

    // Get total count of users for pagination info
    const totalUsers = await User.countDocuments(); // Count total users in the DB

    // Calculate the total number of pages based on the limit and total users
    const totalPages = Math.ceil(totalUsers / limit);

    // Return paginated response
    res.status(200).json({
      success: true,
      users: filteredUsers, // Send filtered users instead of original users
      totalUsers,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

export const getUserForTrainer = async (req, res) => {
  try {
    // Get page and limit from query parameters, with defaults
    const { page = 1, limit = 10 } = req.query;

    // Calculate the number of records to skip based on the current page
    const skip = (page - 1) * limit;

    // Fetch paginated users
    const users = await User.find()
      .select("_id first_name last_name email phone_number") // Select specific fields
      .populate({
        path: "role_id",
        select: "-_id role isActive", // Select role and isActive fields from UserRole
        match: { role: { $nin: ["trainer", "admin"] } }, // Exclude users with roles "trainer" and "admin"
      })
      .skip(skip) // Skip records based on the page number
      .limit(Number(limit)); // Limit the number of records returned

    // Filter out users with a null role_id (null role happens when excluding admin)
    const filteredUsers = users.filter((user) => user.role_id !== null);

    // Get total count of users for pagination info
    const totalUsers = await User.countDocuments(); // Count total users in the DB

    // Calculate the total number of pages based on the limit and total users
    const totalPages = Math.ceil(totalUsers / limit);

    // Return paginated response
    res.status(200).json({
      success: true,
      users: filteredUsers, // Send filtered users instead of original users
      totalUsers,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};
//-------------------REMOVE USER BY ID--------------------------------------------------
export const removeUser = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request parameters

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};
//-------------------PASSWORD RESET FROM ADMIN SIDE--------------------------------
export const passwordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password_hash = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ success: false, message: "Error resetting password." });
  }
};

//-----------------------------------UPDATE MEMBERSHIP FROM ADMIN SIDE------------------------------------------
export const updateUserMembership = async (req, res) => {
  try {
    const { userId, membershipId } = req.body;

    // Validate input
    if (!userId || !membershipId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Membership ID are required.",
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if the membership exists
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found.",
      });
    }

    // Update the user's membership plan
    user.membership_id = membershipId;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User's membership updated to ${membership.membership_name}.`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating membership:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user's membership plan.",
    });
  }
};

//-------------------UPDATE USER DATA--------------------------------------------------
export const updateUserData = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request parameters
    const updateData = req.body; // Get update data from request body

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate input
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided.",
      });
    }

    if (updateData.password) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(updateData.password, salt);
    }

    // Update user data
    Object.assign(user, updateData);
    await user.save();

    const { first_name, last_name, email, phone_number, role_id, membership_id, reminders } = user;
    res.status(200).json({
      success: true,
      message: "User data updated successfully",
      data: {
        first_name, last_name, email, phone_number, role_id, membership_id, reminders,
      }
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ success: false, message: "Error updating user data" });
  }
};

//-------------------GET USER BY ID--------------------------------------------------
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request parameters

    // Fetch user by ID
    const user = await User.findById(id).select("_id first_name last_name email phone_number role_id membership_id reminders");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};


export const getUserVerificationToken = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      token: user.verificationToken,
    });
  } catch (error) {
    console.error("Error fetching verification token:", error);
    res.status(500).json({ success: false, message: "Error fetching verification token." });
  }
}
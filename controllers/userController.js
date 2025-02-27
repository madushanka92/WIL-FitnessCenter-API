import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
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

}

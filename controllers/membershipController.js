import Membership from "../models/Membership.js";

// Create a membership programme
export const createMembership = async (req, res) => {
  try {
    let {
      membership_name,
      price,
      membership_description,
      duration_days,
      max_classes_per_week,
    } = req.body;

    // Validate input
    if (!membership_name || typeof membership_name !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid membership name" });
    }
    if (!membership_description || typeof membership_description !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid membership description" });
    }
    if (!price || price <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be greater than 0" });
    }
    if (!duration_days || duration_days <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Duration must be greater than 0 days",
        });
    }
    if (!max_classes_per_week || max_classes_per_week < 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid max classes per week value",
        });
    }

    // Normalize membership name
    membership_name = membership_name.trim().toLowerCase();

    // Case-insensitive duplicate check
    const existingProgramme = await Membership.findOne({
      membership_name: new RegExp(`^${membership_name}$`, "i"),
    });

    if (existingProgramme) {
      return res.status(400).json({
        success: false,
        message: "This Membership Programme already exists",
      });
    }

    // Create new membership
    const newMembershipProgramme = new Membership({
      membership_name,
      price,
      membership_description,
      duration_days,
      max_classes_per_week,
    });

    await newMembershipProgramme.save();
    res.status(201).json({
      success: true,
      message: "Membership created successfully",
      data: newMembershipProgramme,
    });
  } catch (error) {
    console.error("Error creating membership:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all memberships
export const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.status(200).json({ success: true, data: memberships });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update a membership
export const updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      membership_name,
      price,
      membership_description,
      duration_days,
      max_classes_per_week,
    } = req.body;

    // Validate input
    if (membership_name && typeof membership_name !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid membership name" });
    }
    if (membership_description && typeof membership_description !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid membership description" });
    }
    if (price && price <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be greater than 0" });
    }
    if (duration_days && duration_days <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Duration must be greater than 0 days",
        });
    }
    if (max_classes_per_week && max_classes_per_week < 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid max classes per week value",
        });
    }

    // Normalize membership name
    if (membership_name) {
      membership_name = membership_name.trim().toLowerCase();
    }

    const updatedMembership = await Membership.findByIdAndUpdate(
      id,
      {
        membership_name,
        price,
        membership_description,
        duration_days,
        max_classes_per_week,
      },
      { new: true, runValidators: true }
    );

    if (!updatedMembership) {
      return res
        .status(404)
        .json({ success: false, message: "Membership not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Membership updated successfully",
        data: updatedMembership,
      });
  } catch (error) {
    console.error("Error updating membership:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete a membership
export const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMembership = await Membership.findByIdAndDelete(id);

    if (!deletedMembership) {
      return res
        .status(404)
        .json({ success: false, message: "Membership not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Membership deleted successfully" });
  } catch (error) {
    console.error("Error deleting membership:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

import { Router } from "express";
const router = Router();
import UserRole from "../models/UserRole.js";
import User from "../models/User.js";

// Create a new role
export const createRole = async (req, res) => {
    try {
        const { role, isActive } = req.body;

        // Check if role already exists
        const existingRole = await UserRole.findOne({ role: role.trim().toLowerCase() });
        if (existingRole) {
            return res.status(400).json({ success: false, message: "Role already exists" });
        }

        const newRole = new UserRole({ role, isActive });
        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await UserRole.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a role by ID
export const getRoleById = async (req, res) => {
    try {
        const role = await UserRole.findById(req.params.id);
        if (!role) return res.status(404).json({ message: "Role not found" });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a role with validation
export const updateRole = async (req, res) => {
    try {
        const { role, isActive } = req.body;

        // Find the role to update
        const existingRole = await UserRole.findById(req.params.id);
        if (!existingRole) {
            return res.status(404).json({ message: "Role not found" });
        }

        // Check if the role is assigned to any users before deactivating
        if (!isActive) {
            const usersWithRole = await User.countDocuments({ role_id: req.params.id });
            if (usersWithRole > 0) {
                return res.status(400).json({ message: "Cannot deactivate role. It is assigned to users." });
            }
        }

        // Proceed with updating the role
        const updatedRole = await UserRole.findByIdAndUpdate(
            req.params.id,
            { role, isActive },
            { new: true, runValidators: true }
        );

        res.json(updatedRole);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Delete a role
export const deleteRole = async (req, res) => {
    try {
        const roleId = req.params.id;

        // Check if the role is being used by any user
        const usersWithRole = await User.countDocuments({ role_id: roleId });

        if (usersWithRole > 0) {
            return res.status(400).json({ message: "Cannot delete role, it is currently assigned to users." });
        }
        const deletedRole = await UserRole.findByIdAndDelete(req.params.id);
        if (!deletedRole) return res.status(404).json({ message: "Role not found" });
        res.json({ message: "Role deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
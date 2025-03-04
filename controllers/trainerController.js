import { Router } from "express";
const router = Router();
import Trainer from "../models/Trainer.js";
import UserRole from "../models/UserRole.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

// Create a new Trainer
export const createTrainer = async (req, res) => {
    try {
        const { user_id, bio_text, specialty } = req.body;
        const profile_image = req.file ? `/uploads/${req.file.filename}` : null;


        // Check if a trainer with the same user_id already exists
        const existingTrainer = await Trainer.findOne({ user_id });
        if (existingTrainer) {
            return res
                .status(400)
                .json({ success: false, message: "Trainer already exists" });
        }

        // Validate file sizes manually
        if (profile_image && profile_image.size > 2 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: "Profile image must be less than 2MB." });
        }


        // Find the role_id for 'trainer'
        const trainerRole = await UserRole.findOne({ role: "trainer" });
        if (!trainerRole) {
            return res
                .status(400)
                .json({ success: false, message: "Trainer role not found" });
        }

        // Update user's role_id
        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { role_id: trainerRole._id },
            { new: true }
        );

        if (!updatedUser) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Create and save the new Trainer
        const newTrainer = new Trainer({
            user_id,
            bio_text,
            profile_image,
            specialty,
        });
        await newTrainer.save();

        res.status(201).json({ success: true, trainer: newTrainer, updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all Trainers
export const getAllTrainers = async (req, res) => {
    try {
        // Retrieve all trainers from the database
        const trainers = await Trainer.find().populate("user_id");

        // Respond with the list of trainers
        res.json(trainers);
    } catch (error) {
        // Handle errors and respond with status 500
        res.status(500).json({ error: error.message });
    }
};

// Get a Trainer by ID
export const getTrainerById = async (req, res) => {
    try {
        // Find a trainer by the provided ID
        const trainer = await Trainer.findById(req.params.id);

        // If trainer not found, respond with 404
        if (!trainer) return res.status(404).json({ message: "Trainer not found" });

        // Respond with the trainer data
        res.json(trainer);
    } catch (error) {
        // Handle errors and respond with status 500
        res.status(500).json({ error: error.message });
    }
};

// Updating a Trainer
export const updateTrainer = async (req, res) => {
    try {
        // Extract updated trainer details from the request body
        const { user_id, bio_text, specialty } = req.body;

        // Find the existing trainer record
        const existingTrainer = await Trainer.findById(req.params.id);
        if (!existingTrainer)
            return res.status(404).json({ message: "Trainer not found" });

        let profile_image = existingTrainer.profile_image; // Keep the old image by default

        // If a new file is uploaded, delete the old image and update the field
        if (req.file) {
            // Resolve absolute path for old image
            const oldImagePath = path.join(process.cwd(), existingTrainer.profile_image);

            // Check if old image exists and delete it
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            // Set new profile image path
            profile_image = `/uploads/${req.file.filename}`;
        }

        // Update trainer with new details
        const updatedTrainer = await Trainer.findByIdAndUpdate(
            req.params.id,
            { user_id, bio_text, profile_image, specialty },
            { new: true, runValidators: true } // Return updated doc & run validators
        );

        // Respond with the updated trainer
        res.json(updatedTrainer);
    } catch (error) {
        // Handle errors and respond with status 500
        res.status(500).json({ error: error.message });
    }
};

// Delete a Trainer
export const deleteTrainer = async (req, res) => {
    try {
        // Find the trainer by ID
        const deletedTrainer = await Trainer.findByIdAndDelete(req.params.id);

        // If trainer not found, respond with 404
        if (!deletedTrainer)
            return res.status(404).json({ message: "Trainer not found" });

        // Delete profile and background images if they exist
        if (deletedTrainer.profile_image) {
            const profileImagePath = path.join(process.cwd(), deletedTrainer.profile_image); // Ensure absolute path

            if (fs.existsSync(profileImagePath)) {
                fs.unlinkSync(profileImagePath);
            }
        }

        // Find the "member" role ID
        const memberRole = await UserRole.findOne({ role: "member" });
        if (!memberRole)
            return res.status(404).json({ message: "Member role not found" });

        // Update the user's role_id to "member"
        await User.findByIdAndUpdate(deletedTrainer.user_id, {
            role_id: memberRole._id,
        });

        // Respond with success message
        res.json({
            message: "Trainer deleted successfully and user role updated to 'member'",
        });
    } catch (error) {
        // Handle errors and respond with status 500
        res.status(500).json({ error: error.message });
    }
};


export default router;

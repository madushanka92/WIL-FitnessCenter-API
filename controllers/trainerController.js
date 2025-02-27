import { Router } from "express";
const router = Router();
import Trainer from "../models/Trainer.js";
import UserRole from "../models/UserRole.js";
import User from "../models/User.js";

// Create a new Trainer
export const createTrainer = async (req, res) => {
    try {
        const { user_id, bio_text, profile_image, specialty } = req.body;

        // Check if a trainer with the same user_id already exists
        const existingTrainer = await Trainer.findOne({ user_id });
        if (existingTrainer) {
            return res.status(400).json({ success: false, message: "Trainer already exists" });
        }

        // Find the role_id for 'trainer'
        const trainerRole = await UserRole.findOne({ role: "trainer" });
        if (!trainerRole) {
            return res.status(400).json({ success: false, message: "Trainer role not found" });
        }

        // Update user's role_id
        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { role_id: trainerRole._id },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create and save the new Trainer
        const newTrainer = new Trainer({ user_id, bio_text, profile_image, specialty });
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
        const trainers = await Trainer.find().populate('user_id');

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

// Update a Trainer
export const updateTrainer = async (req, res) => {
    try {
        // Extract updated trainer details from the request body
        const { user_id, bio_text, profile_image, specialty } = req.body;

        // Find the trainer by ID and update with new details
        const updatedTrainer = await Trainer.findByIdAndUpdate(
            req.params.id,
            { user_id, bio_text, profile_image, specialty },
            { new: true, runValidators: true } // Return updated doc & run validators
        );

        // If trainer not found, respond with 404
        if (!updatedTrainer) return res.status(404).json({ message: "Trainer not found" });

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
        if (!deletedTrainer) return res.status(404).json({ message: "Trainer not found" });

        // Find the "member" role ID
        const memberRole = await UserRole.findOne({ role: "member" });
        if (!memberRole) return res.status(404).json({ message: "Member role not found" });

        // Update the user's role_id to "member"
        await User.findByIdAndUpdate(deletedTrainer.user_id, { role_id: memberRole._id });

        // Respond with success message
        res.json({ message: "Trainer deleted successfully and user role updated to 'member'" });
    } catch (error) {
        // Handle errors and respond with status 500
        res.status(500).json({ error: error.message });
    }
};

export default router;

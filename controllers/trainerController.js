import { Router } from "express";
const router = Router();
import Trainer from "../models/Trainer.js";

// Create a new Trainer
export const createTrainer = async (req, res) => {
    try {
        // Extract trainer details from the request body
        const { user_id, bio_text, profile_image, specialty } = req.body;

        // Check if a trainer with the same user_id already exists
        const existingTrainer = await Trainer.findOne({ user_id: user_id });
        if (existingTrainer) {
            return res.status(400).json({ success: false, message: "Trainer already exists" });
        }

        // Create and save the new trainer
        const newTrainer = new Trainer({ user_id, bio_text, profile_image, specialty });
        await newTrainer.save();

        // Respond with the newly created trainer
        res.status(201).json(newTrainer);
    } catch (error) {
        // Handle errors and respond with status 500
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
        // Find and delete the trainer by ID
        const deletedTrainer = await Trainer.findByIdAndDelete(req.params.id);

        // If trainer not found, respond with 404
        if (!deletedTrainer) return res.status(404).json({ message: "Trainer not found" });

        // Respond with success message
        res.json({ message: "Trainer deleted successfully" });
    } catch (error) {
        // Handle errors and respond with status 500
        res.status(500).json({ error: error.message });
    }
};

export default router;

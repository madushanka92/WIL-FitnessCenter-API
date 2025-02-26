import Promotion from "../models/Promotion.js";

// Create a new promotion
export const createPromotion = async (req, res) => {
    try {
        const { promo_code, discount_percent, start_date, end_date, active } = req.body;

        // Check if promo code already exists
        const existingPromo = await Promotion.findOne({ promo_code });
        if (existingPromo) {
            return res.status(400).json({ message: "Promo code already exists" });
        }

        const newPromotion = new Promotion({ promo_code, discount_percent, start_date, end_date, active });
        await newPromotion.save();
        
        res.status(201).json(newPromotion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all promotions
export const getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find();
        res.status(200).json(promotions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single promotion by ID
export const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) return res.status(404).json({ message: "Promotion not found" });
        res.status(200).json(promotion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a promotion
export const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPromotion = await Promotion.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedPromotion) return res.status(404).json({ message: "Promotion not found" });

        res.status(200).json(updatedPromotion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a promotion
export const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPromotion = await Promotion.findByIdAndDelete(id);
        if (!deletedPromotion) return res.status(404).json({ message: "Promotion not found" });

        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

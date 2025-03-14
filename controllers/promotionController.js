import { faker } from '@faker-js/faker';
import Promotion from "../models/Promotion.js";
import PaymentPromotion from "../models/PaymentPromotion.js";

// Create a random promotion with admin-specified expiry and percentage
export const createRandomPromotion = async (req, res) => {
  try {
    const { percentage, expiryDate } = req.body;

    // Validate admin inputs
    if (!percentage || percentage < 1 || percentage > 100) {
      return res.status(400).json({ success: false, message: "Percentage must be between 1 and 100." });
    }
    if (!expiryDate || isNaN(Date.parse(expiryDate))) {
      return res.status(400).json({ success: false, message: "Invalid expiry date format." });
    }

    let promo_code;
    let existingPromotion;

    // Ensure promo_code is unique
    do {
      promo_code = faker.string.alphanumeric(8).toUpperCase();
      existingPromotion = await Promotion.findOne({ promo_code });
    } while (existingPromotion);

    // Create and save the promotion
    const promotion = new Promotion({ promo_code, percentage, expiryDate });
    await promotion.save();
    // 

    res.status(201).json({ success: true, message: "Random promotion created successfully.", promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred while creating the promotion.", error });
  }
};

// Get all promotions
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.status(200).json({ success: true, promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error });
  }
};

// Get a single promotion by ID
export const getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found." });
    }
    res.status(200).json({ success: true, promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error });
  }
};

// Update a promotion (Admin only)
export const updatePromotion = async (req, res) => {
  try {
    const { promo_code, percentage, expiryDate, isActive } = req.body;
    const promotionId = req.params.id;

    // Check if promotion is used in an ongoing checkout
    const existingUsage = await PaymentPromotion.findOne({ promo_id: promotionId });
    if (existingUsage) {
      return res.status(400).json({ success: false, message: "This promotion is already applied in a checkout and cannot be modified." });
    }

    // Proceed with update
    const promotion = await Promotion.findByIdAndUpdate(promotionId, { promo_code, percentage, expiryDate, isActive }, { new: true });
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found." });
    }

    res.status(200).json({ success: true, message: "Promotion updated successfully.", promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error });
  }
};

// Delete a promotion (Admin only)
export const deletePromotion = async (req, res) => {
  try {
    const promotionId = req.params.id;

    // Check if promo is already applied in an ongoing checkout
    const usedPromo = await PaymentPromotion.findOne({ promo_id: promotionId });
    if (usedPromo) {
      return res.status(400).json({ success: false, message: "This promotion has been applied in a checkout and cannot be deleted." });
    }

    // Proceed with deletion
    const promotion = await Promotion.findByIdAndDelete(promotionId);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found." });
    }

    res.status(200).json({ success: true, message: "Promotion deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

// Apply a promotion promo_code
export const applyPromotion = async (req, res) => {
  try {
    const { promo_code } = req.body;
    const promotion = await Promotion.findOne({ promo_code, isActive: true });

    if (!promotion) {
      return res.status(404).json({ success: false, message: "Invalid or expired promotion." });
    }

    if (new Date() > new Date(promotion.expiryDate)) {
      return res.status(400).json({ success: false, message: "This promotion has expired." });
    }

    res.status(200).json({ success: true, message: "Promotion applied successfully.", promotion: { promo_code: promotion.promo_code, percentage: promotion.percentage } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error });
  }
};

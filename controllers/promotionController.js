import { faker } from '@faker-js/faker';
import Promotion from "../models/Promotion.js";
import PaymentPromotion from '../models/PaymentPromotion.js';
import { newPromoEmailHelper } from '../helpers/newPromoEmailHelper.js';
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
    
    // Pro is created -> send emails to all users where reminders is true
    await newPromoEmailHelper(promotion);

    res.status(201).json({
      success: true,
      message: "Random promotion created successfully.",
      promotion,
    });

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
    res.status(500).json({ success: false, message: "An unexpected error occurred while applying the promotion. Please try again later.", error });
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
    // Destructure data from request body
    const { promo_code, percentage, expiryDate, isActive } = req.body;
    const promotionId = req.params.id;

    // Find the existing promotion
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found." });
    }

    // If percentage is being updated, check if it's being used in any payments
    if (percentage !== undefined && percentage !== promotion.percentage) {
      const promoPayments = await PaymentPromotion.countDocuments({ promo_id: promotion._id });

      if (promoPayments > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot update the promotion percentage, it is currently assigned to one or more payments."
        });
      }
    }

    // Update the promotion with the new data
    promotion.promo_code = promo_code || promotion.promo_code;
    promotion.percentage = percentage !== undefined ? percentage : promotion.percentage;
    promotion.expiryDate = expiryDate || promotion.expiryDate;
    promotion.isActive = isActive !== undefined ? isActive : promotion.isActive;

    // Save the updated promotion
    await promotion.save();

    // Successfully updated promotion
    res.status(200).json({
      success: true,
      message: "Promotion updated successfully.",
      promotion
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message || error
    });
  }
};


// Delete a promotion (Admin only)
export const deletePromotion = async (req, res) => {
  try {
    // Find the promotion by ID
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found." });
    }

    // Check if the promotion is used in any payments
    const promoPayments = await PaymentPromotion.countDocuments({ promo_id: promotion._id });

    if (promoPayments > 0) {
      return res.status(400).json({
        message: "Cannot delete the promotion, it is currently assigned to one or more payments."
      });
    }

    // Proceed with deletion
    await Promotion.findByIdAndDelete(req.params.id);

    // Successfully deleted promotion
    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully."
    });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message || error
    });
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
      return res.status(400).json({ success: false, message: "This promotion code has been expired." });
    }

    res.status(200).json({ success: true, message: "Promotion applied successfully.", promotion: { promo_code: promotion.promo_code, percentage: promotion.percentage } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error });
  }
};

import Promotion from "../models/Promotion.js";

// Create a new discount (Admin only)
export const createPromotion = async (req, res) => {
    try {
      const { promo_code, percentage, expiryDate } = req.body;
  
      
      // Check if the promotion promo_code already exists
      const existingPromotion = await Promotion.findOne({ promo_code });
      if (existingPromotion) {
        return res.status(400).json({ success: false, message: "Promotion already exists." });
      }
  
      // Create a new promotion
      const promotion = new Promotion({ promo_code, percentage, expiryDate });
      await promotion.save();
  
      res.status(201).json({
        success: true,
        message: "Promotion created successfully.",
        promotion,
      });
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while creating the promotion.",
      });
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

    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { promo_code, percentage, expiryDate, isActive },
      { new: true }
    );

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
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Promotion not found." });
    }

    res.status(200).json({ success: true, message: "Promotion deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error });
  }
};

// Apply a promotion promo_code
export const applyPromotion = async (req, res) => {
  try {
    const { promo_code } = req.body;

    // Find the promotion
    const promotion = await Promotion.findOne({ promo_code, isActive: true });

    if (!promotion) {
      return res.status(404).json({ success: false, message: "Invalid or expired promotion promo_code." });
    }

    // Check if the promotion is expired
    if (new Date() > new Date(promotion.expiryDate)) {
      return res.status(400).json({ success: false, message: "This promotion promo_code has expired." });
    }

    res.status(200).json({
      success: true,
      message: "Promotion applied successfully.",
      promotion: {
        promo_code: promotion.promo_code,
        percentage: promotion.percentage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error });
  }
};

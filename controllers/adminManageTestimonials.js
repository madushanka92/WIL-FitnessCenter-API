import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";

/**
 * Admin Controller for Testimonials
 * Allows an admin to manage testimonials (get, update, approve, delete).
 */

// Get all testimonials
export const getTestimonialsController = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().populate(
      "user",
      "first_name last_name email"
    ); // Populating with first_name, last_name, and email

    // Add full name to the testimonial data
    const testimonialsWithUserNames = testimonials.map((testimonial) => {
      testimonial.user.fullName = `${testimonial.user.first_name} ${testimonial.user.last_name}`;
      return testimonial;
    });

    res.status(200).json({
      success: true,
      testimonials: testimonialsWithUserNames,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching testimonials", error });
  }
};

// Get a single testimonial by ID
export const getTestimonialController = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    res.status(200).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching testimonial", error });
  }
};

// Update a testimonial (e.g., change title, content, rating)
export const updateTestimonialController = async (req, res) => {
  try {
    const { title, content, rating } = req.body;

    // Check if testimonial exists
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    // Update the fields
    testimonial.title = title || testimonial.title;
    testimonial.content = content || testimonial.content;
    testimonial.rating = rating || testimonial.rating;

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating testimonial", error });
  }
};

// Approve a testimonial
export const approveTestimonialController = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    // Approve the testimonial (assuming 'approved' is a boolean field)
    testimonial.isApproved = true;

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial approved successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    res
      .status(500)
      .json({ success: false, message: "Error approving testimonial", error });
  }
};

// Delete a testimonial
export const deleteTestimonialController = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting testimonial", error });
  }
};

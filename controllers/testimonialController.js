import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";

/**
 * Add a Testimonial
 * Allows a user to submit a testimonial.
 */
export const addTestimonialController = async (req, res) => {
  try {
    const { title, content, rating } = req.body;
    const userId = req.user._id; // Assuming user ID is available from auth middleware

    if (!title || !content || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create testimonial
    const newTestimonial = new Testimonial({
      user: userId,
      title,
      content,
      rating,
    });

    await newTestimonial.save();

    res.status(201).json({
      success: true,
      message: "Testimonial submitted successfully. Awaiting approval.",
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error("Testimonial Submission Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error submitting testimonial", error });
  }
};

/**
 * Get Testimonials
 * Fetches testimonials with user name, rating, title, and content.
 */
/* 
export const getTestimonialsController = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate("user", "first_name last_name") // Populate user's name
      .select("title content rating user"); // Select only required fields

    res.status(200).json({
      success: true,
      testimonials: testimonials.map((testimonial) => ({
        title: testimonial.title,
        content: testimonial.content,
        rating: testimonial.rating,
        user: {
          first_name: testimonial.user.first_name,
          last_name: testimonial.user.last_name,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching testimonials", error });
  }
};
*/

export const getTestimonialsController = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }) // Fetch only approved testimonials
      .populate("user", "first_name last_name") // Include user's name
      .select("title content rating user createdAt")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching testimonials", error });
  }
};

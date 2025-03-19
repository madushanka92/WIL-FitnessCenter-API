import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";

/**
 * ✅ Add a Testimonial (Only for Authenticated Users)
 */
export const addTestimonialController = async (req, res) => {
  try {
    const { title, content, rating } = req.body;
    const userId = req.user._id; // Extract user ID from `requireSignIn` middleware

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
      isApproved: false, // Default: Pending approval
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
 * ✅ Get Only the Logged-in User's Testimonials
 */
export const getUserTestimonialsController = async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from `requireSignIn`

    const testimonials = await Testimonial.find({ user: userId }) // Fetch only the user's testimonials
      .select("title content rating createdAt isApproved")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error("Error fetching user testimonials:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching user testimonials",
        error,
      });
  }
};

/**
 * ✅ Get All Approved Testimonials (Public API)
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

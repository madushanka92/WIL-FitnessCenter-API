import { Schema, model } from "mongoose";

const TestimonialSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 255, // Limit title length
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        isApproved: {
            type: Boolean,
            default: false, // Admin must approve before showing publicly
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

export default model("Testimonial", TestimonialSchema);

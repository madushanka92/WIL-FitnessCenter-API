import { Schema, model } from "mongoose";

const RoleSchema = new Schema(
    {
        role: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export default model("UserRole", RoleSchema);

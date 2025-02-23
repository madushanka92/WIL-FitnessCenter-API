import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  last_name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
  },
  password_hash: {
    type: String,
    required: true,
    maxlength: 255,
  },
  phone_number: {
    type: String,
    maxlength: 20,
  },
  membership_id: {
    type: Schema.Types.ObjectId,
    ref: "Membership",
    default: null,
  },
  role: {
    type: String,
    enum: ["admin", "trainer", "member"],
    default: "member",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpires: {
    type: Date,
    default: null,
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }, // Lock user if exceeded attempts
});

UserSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export default model("User", UserSchema);

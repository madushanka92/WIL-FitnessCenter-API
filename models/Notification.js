import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ["sent", "failed"], required: true },
    sentAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", NotificationSchema);

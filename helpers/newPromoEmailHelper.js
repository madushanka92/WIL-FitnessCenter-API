import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "./emailHelper.js";

export const newPromoEmailHelper = async (promotion) => {
    const users = await User.find({ reminders: true });

    try {
        // Create a meaningful email content
        const emailContent = `
        <h2>🎉 Exciting New Promotion Just for You! 🎉</h2>
        <p>Dear valued member,</p>
        <p>We are thrilled to introduce a brand-new promotion:</p>
        <h3>Promo Code: <strong>${promotion.promo_code}</strong></h3>
        <p>🎁 <strong>Discount:</strong> ${promotion.percentage}% OFF</p>
        
        <p>🔥 Don't miss out! Offer valid until: <strong>${promotion.expiryDate}</strong></p>
        <p>Claim your offer now!</p>
        <br>
        <p>Stay fit and thrive,</p>
        <p><strong>The WIL Fitness Center Team 💪</strong></p>
        `;

        // Send email to all users
        for (const user of users) {
            try {
                await sendEmail(user.email, "New Promotion Just for You!", "", emailContent);

                // Store notification history with type "Promotion"
                await Notification.create({
                    userId: user._id,
                    email: user.email,
                    type: "Promotion", 
                    status: "sent"
                });

            } catch (emailError) {
                console.log(`Failed to send email to ${user.email}:`, emailError);

                // Log failure in Notification history
                await Notification.create({
                    userId: user._id,
                    email: user.email,
                    type: "Promotion",
                    status: "failed"
                });
            }
        }

    } catch (error) {
        console.log("Promo Email Helper Error:", error);
    }
};

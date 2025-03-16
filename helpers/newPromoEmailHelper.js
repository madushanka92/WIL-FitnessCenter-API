import User from "../models/User.js";
import { sendEmail } from "./emailHelper.js";

export const newPromoEmailHelper = async (promotion) => {
    const users = await User.find({ reminders: true });

    try {
        // Create a meaningful email content
        const emailContent = `
    <h2>🎉 Exciting New Promotion Just for You! 🎉</h2>
    <p>Dear valued member,</p>
    <p>We are thrilled to introduce a brand-new promotion:</p>
    <h3>${promotion.promo_code}</h3>
    
    <p>🔥 Don't miss out! Offer valid until: <strong>${promotion.expiryDate}</strong></p>
    <p>Claim your offer now!</p>
    <br>
    <p>Stay fit and thrive,</p>
    <p><strong>The WIL Fitness Center Team 💪</strong></p>
`;

        // Send email to all users
        users.forEach(async (user) => {
            await sendEmail(user.email, "New Promotion Just for You!", "", emailContent);
        });
    } catch (error) {
        console.log("Promo Email Fails : ", error);
    }
};

import { sendEmail } from "../helpers/emailHelper.js";

export const emailVerificationEmail = async (user, title) => {

    try {
        // Send verification email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${user.verificationToken}`;

        const emailSubject = title || "Verify Your Email";

        // HTML Email Template
        const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4CAF50; text-align: center;">Verify Your Email</h2>
            <p style="font-size: 16px; color: #555;">
            Hello <strong>${user.first_name}</strong>,<br><br>
            You're almost there! Please verify your email address to activate your account.
            </p>
            <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationLink}" 
                style="background-color: #4CAF50; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-size: 16px;">
                Verify My Email
            </a>
            </div>
            <p style="font-size: 14px; color: #777; text-align: center;">
            If the button doesn't work, copy and paste the link below in your browser:<br>
            <a href="${verificationLink}" style="color: #4CAF50;">${verificationLink}</a>
            </p>
            <hr style="border: 0.5px solid #ddd;">
            <p style="font-size: 12px; color: #888; text-align: center;">
            If you didn’t request this, please ignore this email. <br>
            Need help? Contact our <a href="mailto:support@fitnthrive.com" style="color: #4CAF50;">support team</a>.
            </p>
        </div>
        `;

        const emailResponse = await sendEmail(user.email, emailSubject, `Click the link to verify: ${verificationLink}`, emailHTML);
        if (emailResponse.success) {
            console.log(`Verification email sent successfully to ${user.email}`);
        } else {
            console.error(`Failed to send verification email to ${user.email}`);
        }

        return { success: true, message: 'verification sent successfully' };
    } catch (error) {
        return { success: false, message: 'Error verification email', error };
    }

};

const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
}
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SecretKeys from "../secret_key.js";

dotenv.config();

// Configure SendGrid transporter
const sendGridApiKey = SecretKeys.EMAILKEY;
const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
        user: "apikey",
        pass: sendGridApiKey,
    },
});

/**
 * Sends an email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 * @returns {Promise} - Resolves if email is sent successfully
 */
export const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: "melbin.study@gmail.com",
            to,
            subject,
            text,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${subject}`);
        return { success: true, message: "Email sent successfully" };
    } catch (error) {
        console.error("Email Sending Error:", error);
        return { success: false, message: "Error sending email", error };
    }
};

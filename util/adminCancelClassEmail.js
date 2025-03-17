import moment from "moment";
import { sendEmail } from "../helpers/emailHelper.js";
import User from "../models/User.js";
import ClassBooking from "../models/ClassBooking.js";

export const adminCancelClassEmail = async (selectedClass) => {
    try {
        // Find all bookings for the canceled class
        const bookings = await ClassBooking.find({ class_id: selectedClass._id });

        // Notify each user who booked the class
        for (const booking of bookings) {
            const user = await User.findById(booking.user_id);
            if (!user || !user.reminders) continue;

            // Construct the user cancellation email content
            const userEmailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #d9534f; text-align: center;">Class Cancellation Notice</h2>
                    <p style="font-size: 16px; color: #555;">
                        Hello <strong>${user.first_name}</strong>,
                    </p>
                    <p style="color: #333;">We regret to inform you that your scheduled class has been canceled.</p>
                    <hr />
                    <p><strong>Class Name:</strong> ${selectedClass.class_name}</p>
                    <p><strong>Trainer:</strong> ${selectedClass.trainer_id?.user_id?.first_name} ${selectedClass.trainer_id?.user_id?.last_name}</p>
                    <p><strong>Date:</strong> ${moment(selectedClass.start_time).format("dddd, MMMM Do YYYY")}</p>
                    <p><strong>Time:</strong> ${moment(selectedClass.start_time).format("hh:mm A")}</p>
                    <p><strong>Location:</strong> ${selectedClass.location || 'Fitness Center'}</p>
                    <br/>
                    <p>We apologize for the inconvenience. You can rebook another class through your account.</p>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.FRONTEND_URL}/class-list" 
                           style="background-color: #d9534f; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-size: 16px;">
                           Browse Available Classes
                        </a>
                    </div>
                    <hr style="border: 0.5px solid #ddd;">
                    <p style="font-size: 12px; color: #888; text-align: center;">
                        Thank you for understanding. <br>
                        Need assistance? Contact our <a href="mailto:support@example.com" style="color: #d9534f;">support team</a>.
                    </p>
                </div>
            `;

            // Send email to user
            await sendEmail(user.email, "Class Cancellation Notice", "Your scheduled class has been canceled", userEmailContent);
        }

        // Notify the trainer
        if (selectedClass.trainer_id?.user_id) {
            const trainer = await User.findById(selectedClass.trainer_id.user_id);

            if (trainer) {
                const trainerEmailContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #d9534f; text-align: center;">Class Cancellation Notification</h2>
                        <p style="font-size: 16px; color: #555;">
                            Hello <strong>${trainer.first_name}</strong>,
                        </p>
                        <p style="color: #333;">We wanted to inform you that one of your scheduled classes has been canceled.</p>
                        <hr />
                        <p><strong>Class Name:</strong> ${selectedClass.class_name}</p>
                        <p><strong>Date:</strong> ${moment(selectedClass.start_time).format("dddd, MMMM Do YYYY")}</p>
                        <p><strong>Time:</strong> ${moment(selectedClass.start_time).format("hh:mm A")}</p>
                        <p><strong>Location:</strong> ${selectedClass.location || 'Fitness Center'}</p>
                        <br/>
                        <p>If you have any concerns, please reach out to the administration team.</p>
                        <hr style="border: 0.5px solid #ddd;">
                        <p style="font-size: 12px; color: #888; text-align: center;">
                            Thank you for your dedication. <br>
                            Need assistance? Contact our <a href="mailto:support@example.com" style="color: #d9534f;">support team</a>.
                        </p>
                    </div>
                `;

                // Send email to trainer
                await sendEmail(trainer.email, "Class Cancellation Notification", "One of your classes has been canceled", trainerEmailContent);
            }
        }

        console.log('Cancellation emails sent successfully to users and trainer');
        return { success: true, message: 'Cancellation emails sent successfully to users and trainer' };

    } catch (error) {
        console.error("Error in admin cancellation email:", error);
        return { success: false, message: 'Error generating/sending cancellation emails', error };
    }
};

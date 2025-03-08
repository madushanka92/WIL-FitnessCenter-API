import moment from "moment";
import { sendEmail } from "../helpers/emailHelper.js";
import User from "../models/User.js";

export const cancelNotificationEmail = async (selectedClass, canceledBooking) => {
    try {
        const user = await User.findById(canceledBooking.user_id);

        // Construct the cancellation notification content
        const cancelNotificationContent = `
            <h3>Class Booking Cancellation</h3>
            <p>Hi ${user.first_name},</p>
            <p>Your class booking has been successfully canceled. Here are your booking details:</p>
            <hr />
            <p><strong>Class Name:</strong> ${selectedClass.class_name}</p>
            <p><strong>Trainer Name:</strong> ${selectedClass.trainer_id?.user_id?.first_name} ${selectedClass.trainer_id?.user_id?.last_name}</p>
            <p><strong>Date:</strong> ${moment(selectedClass.start_time).format("dddd, MMMM Do YYYY")}</p>
            <p><strong>Time:</strong> ${moment(selectedClass.start_time).format("hh:mm A")}</p>
            <p><strong>Location:</strong> ${selectedClass.location || 'Fitness Center'}</p>
            <p><strong>Booking ID:</strong> ${canceledBooking._id}</p>
            <br/>
            <p>If you have any questions or would like to rebook, feel free to contact us.</p>
            <p>Best regards,</p>
            <p><strong>Fitness Center Team</strong></p>
        `;

        // Send the email using the sendEmail function
        const emailResponse = await sendEmail(user.email, "Class Booking Cancellation", "Your class booking has been canceled", cancelNotificationContent);

        if (emailResponse.success) {
            console.log('Cancellation email sent successfully');
            return { success: true, message: 'Cancellation email sent successfully' };
        } else {
            console.error('Failed to send cancellation email');
            return { success: false, message: 'Failed to send cancellation email' };
        }
    } catch (error) {
        console.error("Error in cancellation email:", error);
        return { success: false, message: 'Error generating/sending cancellation email', error };
    }
};

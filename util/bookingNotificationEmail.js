import moment from "moment";
import User from "../models/User.js";

export const bookingNotification = async (selectedClass, newBooking) => {
    // Fetch additional user details if necessary
    const user = await User.findById(newBooking.user_id);

    // Construct the invoice in HTML format with styling
    const notificationContent = `
       <h3>Class Booking Confirmation</h3>
            <p>Hi ${user.first_name},</p>
            <p>You have successfully booked a class. Here are your booking details:</p>
            <hr />
            <p><strong>Class Name:</strong> ${selectedClass.class_name}</p>
            <p><strong>Trainer Name:</strong> ${selectedClass.trainer_id?.user_id?.first_name} ${selectedClass.trainer_id?.user_id?.last_name}</p>
            <p><strong>Date:</strong> ${moment(selectedClass.start_time).format("dddd, MMMM Do YYYY")}</p>
            <p><strong>Time:</strong> ${moment(selectedClass.start_time).format("hh:mm A")}</p>
            <p><strong>Location:</strong> ${selectedClass.location || 'Fitness Center'}</p>
            <p><strong>Booking ID:</strong> ${newBooking._id}</p>
            <br/>
            <p>We look forward to seeing you in class!</p>
            <p>Best regards,</p>
            <p><strong>Fitness Center Team</strong></p>
    `;

    return notificationContent;
};

const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
}
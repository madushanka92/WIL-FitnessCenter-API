import ClassBooking from "../models/ClassBooking.js";
import Class from "../models/Class.js";
import Membership from "../models/Membership.js";
import moment from "moment";
import { tokenDecoder } from "../helpers/decodeHelper.js";
import { bookingNotification } from "../util/bookingNotificationEmail.js";
import User from "../models/User.js";
import { sendEmail } from "../helpers/emailHelper.js";
import { cancelNotificationEmail } from "../util/cancelNotificationEmail.js";

export const bookClass = async (req, res) => {
    try {
        const { class_id } = req.body;
        const { user_id, membership_id } = tokenDecoder(req);

        // Fetch Membership Details
        const membership = await Membership.findById(membership_id);
        if (!membership) {
            return res
                .status(404)
                .json({ success: false, message: "Membership is required !" });
        }

        // Check If Class Exists
        const selectedClass = await Class.findById(class_id).populate({
            path: "trainer_id",
            populate: {
                path: "user_id",
                model: "User",
                select: "first_name last_name email phone_number",
            },
        })
        if (!selectedClass) {
            return res
                .status(404)
                .json({ success: false, message: "Class not found." });
        }

        // Get This Week's Range (Start/End Date)
        const startOfWeek = moment().startOf("isoWeek").toDate();  // ISO week starts on Monday
        const endOfWeek = moment().endOf("isoWeek").toDate();

        // Fetch All User's Bookings (regardless of week)
        const weeklyBookings = await ClassBooking.find({
            user_id,
            status: "booked"
        }).populate("class_id");

        // Now Filter Classes By "Start Date" In This Week
        const classesThisWeek = weeklyBookings.filter((booking) => {
            const classStartDate = new Date(booking.class_id.start_time); // Class start time
            return classStartDate >= startOfWeek && classStartDate <= endOfWeek;
        });

        // Check If User Exceeded Max Classes Per Week
        if (classesThisWeek.length >= membership.max_classes_per_week) {
            return res.status(400).json({
                success: false,
                message: `You have reached your maximum class limit (${membership.max_classes_per_week}) for this week.`,
            });
        }

        // Check If User Already Booked This Class
        const existingBooking = await ClassBooking.findOne({
            user_id,
            class_id,
            status: "booked",
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "You have already booked this class.",
            });
        }

        // Check Class Capacity
        const classBookings = await ClassBooking.find({
            class_id,
            status: "booked",
        });

        if (classBookings.length >= selectedClass.max_capacity) {
            return res.status(400).json({
                success: false,
                message: "This class has reached its maximum capacity.",
            });
        }

        // Book The Class
        const newBooking = new ClassBooking({
            user_id,
            class_id,
            status: "booked",
        });

        await newBooking.save();

        // Send Notification email after successful booking
        const sendNotificationResponse = await sendNotificationEmail(selectedClass, newBooking);

        if (sendNotificationResponse.success) {
            return res.status(200).json({
                success: true,
                message: 'Class booked successfully, notification sent',
                booking: newBooking,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Class booked successfull, but failed to send notification email',
                booking: newBooking,
            });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const cancelClassBooking = async (req, res) => {
    try {
        const { class_id } = req.body;
        const { user_id } = tokenDecoder(req);


        // Check If Class Exists
        const selectedClass = await Class.findById(class_id).populate({
            path: "trainer_id",
            populate: {
                path: "user_id",
                model: "User",
                select: "first_name last_name email phone_number",
            },
        })
        if (!selectedClass) {
            return res
                .status(404)
                .json({ success: false, message: "Class not found." });
        }

        //  Check If Booking Exists
        const existingBooking = await ClassBooking.findOne({
            user_id,
            class_id,
            status: "booked"
        });

        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: "You do not have any booking for this class."
            });
        }

        //  Update Booking Status to "cancelled"
        existingBooking.status = "canceled";
        await existingBooking.save();

        // Send Cancellation Notification Email
        const sendCancelNotificationResponse = await cancelNotificationEmail(selectedClass, existingBooking);

        if (sendCancelNotificationResponse.success) {
            return res.status(200).json({
                success: true,
                message: 'Your class booking has been cancelled successfully., notification sent',
                booking: existingBooking,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Your class booking has been cancelled successfully., but failed to send notification email',
                booking: existingBooking,
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        }); 
    }
};

export const sendNotificationEmail = async (selectedClass, newBooking) => {
    try {
        const user = await User.findById(newBooking.user_id);
        const notificationContent = await bookingNotification(selectedClass, newBooking);

        // Send the email using the sendEmail function
        const emailResponse = await sendEmail(user.email, "Class Booking", "Your class details", notificationContent);

        if (emailResponse.success) {
            console.log('Notification email sent successfully');
            return { success: true, message: 'Notification sent successfully' };
        } else {
            console.error('Failed to send Notification email');
            return { success: false, message: 'Failed to send Notification email' };
        }
    } catch (error) {
        return { success: false, message: 'Error generating/sending Notification', error };
    }
}



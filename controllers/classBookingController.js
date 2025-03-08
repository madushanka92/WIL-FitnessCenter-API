import ClassBooking from "../models/ClassBooking.js";
import Class from "../models/Class.js";
import Membership from "../models/Membership.js";
import moment from "moment";
import { tokenDecoder } from "../helpers/decodeHelper.js";

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
        const selectedClass = await Class.findById(class_id);
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

        res.status(201).json({
            success: true,
            message: "Class booked successfully.",
            booking: newBooking,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const cancelClassBooking = async (req, res) => {
    try {
        const { class_id } = req.body;
        const { user_id } = tokenDecoder(req);

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

        res.status(200).json({
            success: true,
            message: "Your class booking has been cancelled successfully.",
            booking: existingBooking
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



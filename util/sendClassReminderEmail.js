import moment from "moment";
import { sendEmail } from "../helpers/emailHelper.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

export const sendClassReminderEmail = async (user, selectedClass, reminderTime) => {
    try {
        // Construct the reminder email content
        const reminderContent = `
            <h3>Class Booking Reminder</h3>
            <p>Hi ${user.first_name},</p>
            <p>This is a reminder for your upcoming class. Here are your booking details:</p>
            <hr />
            <p><strong>Class Name:</strong> ${selectedClass.class_name}</p>
            <p><strong>Trainer Name:</strong> ${selectedClass.trainer_id?.user_id?.first_name} ${selectedClass.trainer_id?.user_id?.last_name}</p>
            <p><strong>Date:</strong> ${moment(selectedClass.start_time).format("dddd, MMMM Do YYYY")}</p>
            <p><strong>Time:</strong> ${moment(selectedClass.start_time).format("hh:mm A")}</p>
            <p><strong>Location:</strong> ${selectedClass.location || 'Fitness Center'}</p>
            <p><strong>Booking ID:</strong> ${selectedClass._id}</p>
            <br/>
            <p>Your class starts in ${reminderTime}.</p>
            <p>If you need any assistance or want to make changes to your booking, feel free to contact us.</p>
            <p>Best regards,</p>
            <p><strong>Fitness Center Team</strong></p>
        `;

        // Send the email using the sendEmail function
        const emailResponse = await sendEmail(user.email, "Class Booking Reminder", `Your class starts in ${reminderTime}`, reminderContent);

        if (emailResponse.success) {
            console.log(`${reminderTime} reminder email sent successfully to ${user.email}`);
            return { success: true, message: `${reminderTime} reminder email sent successfully` };
        } else {
            console.error(`Failed to send ${reminderTime} reminder email`);
            return { success: false, message: `Failed to send ${reminderTime} reminder email` };
        }
    } catch (error) {
        console.error("Error in sending class reminder email:", error);
        return { success: false, message: 'Error generating/sending class reminder email', error };
    }
};

export const cronJobReminder = async (bookedClass) => {
    try {
        const { user_id, class_id } = bookedClass;
        const user = await User.findById(user_id);
        const selectedClass = await Class.findById(class_id).populate({
            path: "trainer_id",
            populate: {
                path: "user_id",
                model: "User",
                select: "first_name last_name email phone_number",
            },
        });

        if (!user || !selectedClass) {
            console.error('User or Class not found');
            return;
        } else if (!user.reminders) {
            console.error('User turn off notifications');
            return;
        }

        const classStartTime = new Date(selectedClass.start_time);
        const currentTime = new Date();
        const timeDifference = classStartTime - currentTime;
        const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Check if the class is 1 hour or 24 hours away and send the appropriate reminder email
        if (timeDifference <= twentyFourHoursInMs && timeDifference > twentyFourHoursInMs - oneHourInMs) {
            // Class starts within 24 hours
            await sendClassReminderEmail(user, selectedClass, '24 hours');
        } else if (timeDifference <= oneHourInMs && timeDifference > 0) {
            // Class starts within 1 hour
            await sendClassReminderEmail(user, selectedClass, '1 hour');
        }
    } catch (error) {
        console.error('Error in cron job reminder:', error);
    }
};

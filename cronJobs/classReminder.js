import cron from 'node-cron';
import ClassBooking from '../models/ClassBooking.js';
import { cronJobReminder } from '../util/sendClassReminderEmail.js';

// Schedule the cron job to run every hour
cron.schedule('0 * * * *', async () => {
    try {
        console.log("Reminder Running . ..  .")
        const bookedClasses = await ClassBooking.find({ status: 'booked' })
            .populate('user_id')
            .populate('class_id');

        for (const booking of bookedClasses) {
            await cronJobReminder(booking);
        }
    } catch (error) {
        console.error('Error running cron job:', error);
    }
});

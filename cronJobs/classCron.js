import cron from 'node-cron';
import Class from '../models/Class.js';

// This cron job will run every minute and mark classes as 'completed'
cron.schedule('*/15 * * * *', async () => {
    console.log("Running class status update job...");

    const now = new Date();

    try {
        // Find all classes that are still 'upcoming' but their start time has passed
        const classesToUpdate = await Class.find({
            status: "upcoming",
            start_time: { $lte: now }
        });

        if (classesToUpdate.length > 0) {
            for (const cls of classesToUpdate) {
                // Calculate end time based on duration
                const endTime = new Date(cls.start_time.getTime() + cls.duration_mins * 60000);

                // If the class end time has passed, mark it as 'completed'
                if (endTime <= now) {
                    cls.status = "completed";
                    await cls.save();
                    console.log(`Class "${cls.class_name}" marked as completed.`);
                }
            }
        } else {
            console.log("No classes to update.");
        }
    } catch (error) {
        console.error("Error updating class status:", error);
    }
});

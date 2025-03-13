import User from "../models/User.js";
import Membership from "../models/Membership.js";
import MembershipHistory from "../models/MembershipHistory.js";

export const isMembershipActive = async (userId) => {
    const user = await User.findById(userId).populate("membership_id");

    if (!user || !user.membership_id || !user.membership_start_date) {
        return false; // No active membership
    }

    const membership = user.membership_id;
    const expirationDate = new Date(user.membership_start_date);
    expirationDate.setDate(expirationDate.getDate() + membership.duration_days);

    if (expirationDate <= new Date()) {
        // Remove the active membership from the user
        await User.findByIdAndUpdate(userId, { $set: { membership_id: null } });

        // Find the latest membership history record for this user
        const latestHistory = await MembershipHistory.findOne({
            user_id: userId,
        }).sort({ change_date: -1 }); // Sort to get the latest entry

        if (latestHistory) {
            // Update the latest record to reflect expiry
            await MembershipHistory.findByIdAndUpdate(latestHistory._id, {
                $set: {
                    change_type: "cancellation",
                    reason: "Membership expired",
                    change_date: new Date(),
                },
            });
        }
    }

    return expirationDate > new Date(); // Compare with the current date
};

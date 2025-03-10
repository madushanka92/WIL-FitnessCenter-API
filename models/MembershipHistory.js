import { Schema, model } from 'mongoose';

const MembershipHistorySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    previous_membership_id: {
        type: Schema.Types.ObjectId,
        ref: 'Membership',
        default: null
    },
    new_membership_id: {
        type: Schema.Types.ObjectId,
        ref: 'Membership',
        required: true
    },
    change_type: {
        type: String,
        enum: ['upgrade', 'downgrade', 'cancellation', 'renew', "new"],
        required: true
    },
    change_date: {
        type: Date,
        default: Date.now
    },
    payment_id: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },
    reason: {
        type: String,
        default: null
    }
});

export default model('MembershipHistory', MembershipHistorySchema);

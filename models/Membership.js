import { Schema, Types, model } from 'mongoose';

const MembershipSchema = new Schema({
    membership_name: {
        type: String,
        required: true,
        maxlength: 50
    },
    price: {
        type: Types.Decimal128,
        required: true,
        min: 0
    },
    duration_days: {
        type: Number,
        required: true,
        min: 1
    },
    max_classes_per_week: {
        type: Number,
        required: true,
        min: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default model('Membership', MembershipSchema);

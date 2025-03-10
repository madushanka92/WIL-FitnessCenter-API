import { Schema, Types, model } from 'mongoose';

const PaymentSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    membership_id: {
        type: Schema.Types.ObjectId,
        ref: 'Membership',
        default: null
    },
    amount: {
        type: Types.Decimal128,
        required: true,
        min: 0
    },
    payment_method: {
        type: String,
        enum: ['credit_card', 'paypal', 'stripe'],
        required: true
    },
    payment_status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        required: true
    },
    transaction_id: {
        type: String,
        unique: true,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default model('Payment', PaymentSchema);

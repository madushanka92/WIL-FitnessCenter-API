import { Schema, model } from 'mongoose';

const InvoiceSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payment_id: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    invoice_number: {
        type: String,
        unique: true,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    invoice_status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'canceled'],
        default: 'pending'
    },
    issued_at: {
        type: Date,
        default: Date.now
    },
    due_date: {
        type: Date,
        required: true
    },
    paid_at: {
        type: Date,
        default: null
    }
});

export default model('Invoice', InvoiceSchema);

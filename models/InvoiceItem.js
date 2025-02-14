import { Schema, model } from 'mongoose';

const InvoiceItemSchema = new Schema({
    invoice_id: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    item_description: {
        type: String,
        required: true,
        maxlength: 255
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    unit_price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

export default model('InvoiceItem', InvoiceItemSchema);

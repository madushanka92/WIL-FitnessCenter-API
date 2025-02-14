import { Schema, Types, model } from 'mongoose';

const PaymentPromotionSchema = new Schema({
    payment_id: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    promo_id: {
        type: Schema.Types.ObjectId,
        ref: 'Promotion',
        required: true
    },
    discount_applied: {
        type: Types.Decimal128,
        required: true,
        min: 0
    }
});

export default model('PaymentPromotion', PaymentPromotionSchema);

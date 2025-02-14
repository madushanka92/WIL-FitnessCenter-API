import { Schema, Types, model } from 'mongoose';

const PromotionSchema = new Schema({
    promo_code: {
        type: String,
        unique: true,
        required: true,
        maxlength: 50
    },
    discount_percent: {
        type: Types.Decimal128,
        required: true,
        min: 0,
        max: 100
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

export default model('Promotion', PromotionSchema);

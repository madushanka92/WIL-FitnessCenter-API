import { Schema, model } from 'mongoose';

const ClassBookingSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    class_id: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    booking_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['booked', 'canceled', 'attended'],
        required: true
    }
});

export default model('ClassBooking', ClassBookingSchema);

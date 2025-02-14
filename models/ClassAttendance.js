import { Schema, model } from 'mongoose';

const ClassAttendanceSchema = new Schema({
    booking_id: {
        type: Schema.Types.ObjectId,
        ref: 'ClassBooking',
        required: true
    },
    scanned_at: {
        type: Date,
        default: Date.now
    }
});

export default model('ClassAttendance', ClassAttendanceSchema);

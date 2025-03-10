import { Schema, model } from 'mongoose';

const ClassSchema = new Schema({
    trainer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    class_name: {
        type: String,
        required: true,
        maxlength: 100
    },
    max_capacity: {
        type: Number,
        required: true,
        min: 1
    },
    start_time: {
        type: Date,
        required: true
    },
    duration_mins: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ["upcoming", "completed", "canceled"],
        default: "upcoming"
    },
    cancellation_reason: {
        type: String,
        maxlength: 255,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default model('Class', ClassSchema);

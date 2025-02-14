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
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default model('Class', ClassSchema);

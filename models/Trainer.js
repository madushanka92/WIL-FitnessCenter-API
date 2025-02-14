import { Schema, model } from 'mongoose';


const TrainerSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio_text: {
        type: String,
        default: null
    },
    profile_image: {
        type: String,
        default: null
    },
    specialty: {
        type: String,
        maxlength: 255
    }
});

export default model('Trainer', TrainerSchema);
import { Schema, model } from 'mongoose';

const BlogLikeSchema = new Schema({
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'BlogPost',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default model('BlogLike', BlogLikeSchema);

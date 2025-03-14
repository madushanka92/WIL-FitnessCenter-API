import { Schema, model } from 'mongoose';

const BlogPostSchema = new Schema({
    admin_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 255
    },
    content: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    blog_image: {
        type: Array,
        default: []
    },
    author: {
        type: String,
        require: true
    }
});

BlogPostSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

export default model('BlogPost', BlogPostSchema);

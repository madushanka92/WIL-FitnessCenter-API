import BlogComment from '../models/BlogComment.js';
import JWT from 'jsonwebtoken';
import BlogPost from '../models/BlogPost.js';

// Create a Blog Comment
export const createBlogComment = async (req, res) => {
    try {
        const { post_id, comment_text } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const user_id = decoded._id;

        // If the post exists
        const blogPost = await BlogPost.findById(post_id);

        if (!blogPost) {
            return res.status(404).json({ message: 'Post not found' });  // Post doesn't exist
        }

        const newBlogComment = new BlogComment({ post_id, user_id, comment_text });
        await newBlogComment.save();

        res.status(201).json({ success: true, blogComment: newBlogComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all Blog Comments (Authenticated users)
export const getAllBlogComments = async (req, res) => {
    try {
        const blogComments = await BlogComment.find()
                                              .populate("user_id", "first_name last_name")  // Populate user details
                                              .populate("post_id", "title");  // Populate post title

        if (!blogComments || blogComments.length === 0) {
            return res.status(404).json({ message: 'No comments found' });
        }

        res.json(blogComments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get all Comments for a specific Blog Post
export const getCommentsByPostId = async (req, res) => {
    try {
        const comments = await BlogComment.find({ post_id: req.params.postId })
            .populate('user_id', 'first_name last_name')  // Populate user details
            .populate('post_id', 'title');  // Populate post title
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Get a Specific Comment by Its ID
export const getCommentById = async (req, res) => {
    try {
        const comment = await BlogComment.findById(req.params.commentId)
            .populate('user_id', 'first_name last_name')  // Populate user details
            .populate('post_id', 'title');  // Populate post title

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a Blog Comment
export const updateBlogComment = async (req, res) => {
    try {
        const { comment_text } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const user_id = decoded._id;

        const comment = await BlogComment.findOne({ _id: req.params.commentId, user_id });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        comment.comment_text = comment_text;
        await comment.save();

        res.json({ success: true, updatedComment: comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a Blog Comment
export const deleteBlogComment = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const user_id = decoded._id;

        const deletedComment = await BlogComment.findOneAndDelete({ _id: req.params.commentId, user_id });
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized' });
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    createBlogComment,
    getCommentsByPostId,
    getCommentById,  
    updateBlogComment,
    deleteBlogComment,
};

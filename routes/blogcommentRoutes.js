import express from 'express';
import { requireSignIn } from '../middlewares/authMiddleware.js';
import { 
    createBlogComment, 
    getAllBlogComments,
    getCommentsByPostId, 
    getCommentById, 
    updateBlogComment, 
    deleteBlogComment 
} from '../controllers/blogCommentController.js';

const router = express.Router();

// Create a Comment (Authenticated users)
router.post('/', requireSignIn, createBlogComment);

// Get all Comments  (Admin Only)
router.get('/', requireSignIn, getAllBlogComments);

// Get Comments for a Specific Blog Post (Authenticated users)
router.get('/post/:postId', requireSignIn, getCommentsByPostId);

// Get Comments for a Specific Blog Post (Authenticated users)
router.get('/:commentId', requireSignIn, getCommentById);

// Update a Comment (Authenticated users)
router.put('/:commentId', requireSignIn, updateBlogComment);

// Delete a Comment (Authenticated users)
router.delete('/:commentId', requireSignIn, deleteBlogComment);

export default router;

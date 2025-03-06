import express from 'express';
import { requireSignIn } from '../middlewares/authMiddleware.js';
import { 
    createBlogLike, 
    getAllBlogLikes, 
    getLikesByPostId, 
    removeBlogLike 
} from '../controllers/blogLikesController.js';

const router = express.Router();

// Like a blog post (Authenticated users)
router.post('/', requireSignIn, createBlogLike);

// Get all likes (Admin only)
router.get('/', requireSignIn, getAllBlogLikes);

// Get likes for a specific blog post (Authenticated users)
router.get('/post/:postId', requireSignIn, getLikesByPostId);

// Unlike a blog post (Authenticated users)
router.delete('/:postId', requireSignIn, removeBlogLike);

export default router;

import express from 'express';
import { requireSignIn, isAdmin } from '../middlewares/authMiddleware.js';
import {
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost,
    getRelatedPosts
} from '../controllers/blogPostController.js';
import upload from '../middlewares/multerConfig.js';

const router = express.Router();

// Create a new Blog Post (Admin only)
router.post('/', requireSignIn, isAdmin, upload.array("blog_images", 5), createBlogPost);

// Get all Blog Posts (Authenticated users)
router.get('/', getAllBlogPosts);

// Get a specific Blog Post by ID (Authenticated users)
router.get('/:id', getBlogPostById);

// Get related blog posts based on category/tags
router.get('/related/:id', getRelatedPosts);
// Update a Blog Post (Admin only)
router.put('/:id', requireSignIn, isAdmin, upload.array("blog_images", 5), updateBlogPost);

// Delete a Blog Post (Admin only)
router.delete('/:id', requireSignIn, isAdmin, deleteBlogPost);

export default router;

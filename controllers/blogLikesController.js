import { Router } from "express";
import BlogLike from "../models/BlogLike.js";
import JWT from "jsonwebtoken";
import BlogPost from '../models/BlogPost.js';
import redisClient from "../config/redis.js";

const router = Router();

// Create a Blog Like
export const createBlogLike = async (req, res) => {
    try {
        const { post_id, like } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.split(" ")[1];
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const user_id = decoded._id;

        // Check if the post exists
        const blogPost = await BlogPost.findById(post_id);
        if (!blogPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user has already liked/disliked the post
        let blogLike = await BlogLike.findOne({ post_id, user_id });

        if (blogLike) {
            blogLike.like = like; // Update the existing like status
        } else {
            blogLike = new BlogLike({ post_id, user_id, like }); // Create a new like entry
        }

        await blogLike.save(); // Save the updated or new like

        // clear blog post cache
        await redisClient.del(process.env.BLOG_CACHE_KEY);

        res.status(201).json({ success: true, blogLike });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get all Blog Likes
export const getAllBlogLikes = async (req, res) => {
    try {
        const blogLikes = await BlogLike.find().populate("user_id", "first_name last_name").populate("post_id", "title");
        res.json(blogLikes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Likes for a Specific Blog Post
export const getLikesByPostId = async (req, res) => {
    try {
        const likes = await BlogLike.find({ post_id: req.params.postId }).populate("user_id", "first_name last_name");
        res.json(likes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove a Like (Unlike a Post)
export const removeBlogLike = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const user_id = decoded._id;

        const deletedLike = await BlogLike.findOneAndDelete({ post_id: req.params.postId, user_id });
        if (!deletedLike) {
            return res.status(404).json({ message: "Like not found" });
        }

        // clear blog post cache
        await redisClient.del(process.env.BLOG_CACHE_KEY);

        res.json({ message: "Like removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default router;

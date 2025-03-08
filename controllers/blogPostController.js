import { Router } from "express";
import BlogPost from "../models/BlogPost.js";
import JWT from "jsonwebtoken";

const router = Router();

// Create a new Blog Post
export const createBlogPost = async (req, res) => {
    try {
        const { title, content } = req.body;


        const authHeader = req.headers.authorization;

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.split(" ")[1];

        // Verify the JWT token from the authorization header
        const decode = JWT.verify(token, process.env.JWT_SECRET);

        const admin_id = decode._id;

        const newBlogPost = new BlogPost({
            admin_id,
            title,
            content
        });

        await newBlogPost.save();
        res.status(201).json({ success: true, blogPost: newBlogPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all Blog Posts
export const getAllBlogPosts = async (req, res) => {
    try {
        const blogPosts = await BlogPost.find().populate("admin_id", "first_name last_name");
        res.json(blogPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a Blog Post by ID
export const getBlogPostById = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id).populate("admin_id", "first_name last_name");
        if (!blogPost) return res.status(404).json({ message: "Blog Post not found" });
        res.json(blogPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a Blog Post
export const updateBlogPost = async (req, res) => {
    try {
        const { title, content } = req.body;

        const existingBlogPost = await BlogPost.findById(req.params.id);
        if (!existingBlogPost) return res.status(404).json({ message: "Blog Post not found" });

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { title, content, updated_at: Date.now() },
            { new: true, runValidators: true }
        );

        res.json(updatedBlogPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a Blog Post
export const deleteBlogPost = async (req, res) => {
    try {
        const deletedBlogPost = await BlogPost.findByIdAndDelete(req.params.id);
        if (!deletedBlogPost) return res.status(404).json({ message: "Blog Post not found" });

        res.json({ message: "Blog Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default router;

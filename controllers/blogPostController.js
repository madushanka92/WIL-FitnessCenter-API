import { Router } from "express";
import BlogPost from "../models/BlogPost.js";
import JWT from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { newBlogPostNotificationEmail } from "../util/newBlogPostNotificationEmail.js";

const router = Router();

// Create a new Blog Post
export const createBlogPost = async (req, res) => {
    try {
        const { title, content, author } = req.body; 
        const files = req.files;

        let blog_image = undefined;
        if (files)
            blog_image = files.map(file => file.path = "/" + file.path);
        let validFileSize = true;

        // // Validate file sizes manually
        if (files && files.length > 0) {
            files.forEach(element => {
                if (element.size > 2 * 1024 * 1024) {
                    validFileSize = false;
                }
            });
        }

        if (!validFileSize) {
            files.forEach(x => {
                // Resolve absolute path for old image
                const oldImagePath = path.join(process.cwd(), x.path);
                // Check if old image exists and delete it
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            });
            return res.status(400).json({ success: false, message: "Blog post image must be less than 2MB." });
        }

        const authHeader = req.headers.authorization;

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.split(" ")[1];

        // Verify the JWT token from the authorization header
        const decode = JWT.verify(token, process.env.JWT_SECRET);

        const admin_id = decode._id;

        const newBlogPost = new BlogPost({
            admin_id,
            title,
            content,
            author,
            blog_image
        });

        // Send email notifications to users
        await newBlogPostNotificationEmail(newBlogPost);

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

        const port = process.env.PORT || 3000;
        blogPosts.forEach(blogPost => {
            if (blogPost.blog_image && blogPost.blog_image.length > 0) {
                blogPost.blog_image = blogPost.blog_image.map(image =>
                    image = "http://localhost:" + port + image
                );
            }
        });

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
        if (blogPost.blog_image) {
            const port = process.env.PORT || 3000;
            blogPost.blog_image = blogPost.blog_image.map((image) => image = "http://localhost:" + port + image)
        }
        res.json(blogPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a Blog Post
export const updateBlogPost = async (req, res) => {
    try {
        const { title, content, author } = req.body;

        const existingBlogPost = await BlogPost.findById(req.params.id);
        if (!existingBlogPost) return res.status(404).json({ message: "Blog Post not found" });

        const files = req.files;
        let blog_image = existingBlogPost.blog_image; // Keep old images by default
        let validFileSize = true;

        // Handle new file uploads
        if (files && files.length > 0) {
            // Validate file sizes manually
            files.forEach(file => {
                if (file.size > 2 * 1024 * 1024) {
                    validFileSize = false;
                }
            });

            // If any file exceeds the limit, delete newly uploaded files and return error
            if (!validFileSize) {
                files.forEach(x => {
                    const newImagePath = path.join(process.cwd(), x.path);
                    if (fs.existsSync(newImagePath)) {
                        fs.unlinkSync(newImagePath);
                    }
                });
                return res.status(400).json({ success: false, message: "Each image must be less than 2MB." });
            }

            // Delete old images since new images are uploaded
            existingBlogPost.blog_image.forEach(imagePath => {
                const oldImagePath = path.join(process.cwd(), imagePath);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            });

            // Map new image paths
            blog_image = files.map(file => "/" + file.path);
        }

        // Update the blog post
        const updatedBlogPost = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { title, content, blog_image, author, updated_at: Date.now() },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, blogPost: updatedBlogPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a Blog Post
export const deleteBlogPost = async (req, res) => {
    try {

        const existingBlogPost = await BlogPost.findById(req.params.id);
        if (!existingBlogPost) return res.status(404).json({ message: "Blog Post not found" });

        if (existingBlogPost.blog_image.length > 0) {
            existingBlogPost.blog_image.forEach(x => {
                // Resolve absolute path for old image
                const oldImagePath = path.join(process.cwd(), x);
                // Check if old image exists and delete it
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            });
        }

        const deletedBlogPost = await BlogPost.findByIdAndDelete(req.params.id);
        if (!deletedBlogPost) return res.status(404).json({ message: "Blog Post not found" });

        res.json({ message: "Blog Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default router;

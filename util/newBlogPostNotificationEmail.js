import moment from "moment";
import { sendEmail } from "../helpers/emailHelper.js";
import User from "../models/User.js";

export const newBlogPostNotificationEmail = async (newBlogPost) => {
    try {
        // Fetch all users who should receive the notification
        const users = await User.find({ reminders: true });

        if (!users || users.length === 0) return { success: false, message: 'No users to notify' };

        // Construct the email content for the new blog post
        const blogPostContent = `
            <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
                <h2 style="color: #4CAF50;">New Blog Post Published</h2>
                <p>Hi there,</p>
                <p>We are excited to announce that a new blog post has been published on our website!</p>
                <hr style="border: 1px solid #ddd;"/>

                <p><strong>Blog Title:</strong> ${newBlogPost.title}</p>
                <p><strong>Author:</strong> ${newBlogPost.author}</p>
                <p><strong>Posted on:</strong> ${moment(newBlogPost.created_at).format("MMMM Do YYYY")}</p>

                <p><strong>Summary:</strong> ${newBlogPost.content.substring(0, 150)}...</p>
                
                <br />
                <p style="font-weight: bold;">To read the full post, click the link below:</p>
                <a href="${process.env.FRONTEND_URL}/blog-post/${newBlogPost._id}" target="_blank" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Read Full Post</a>

                <br /><br />
                <p>We hope you enjoy the read!</p>
                
                <p>Best regards,</p>
                <p><strong>Fitness Center Team</strong></p>
                
                <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
                    <p>If you no longer wish to receive notifications, you can <a href="${process.env.FRONTEND_URL}/my-profile" style="color: #4CAF50;">update your preferences</a>.</p>
                </footer>
            </div>
        `;

        // Loop through all users and send them the email notification
        for (const user of users) {
            const emailResponse = await sendEmail(user.email, "New Blog Post Published", "A new blog post has been published", blogPostContent);

            if (emailResponse.success) {
                console.log(`New blog post email sent successfully to ${user.email}`);
            } else {
                console.error(`Failed to send new blog post email to ${user.email}`);
            }
        }

        return { success: true, message: 'New blog post notifications sent successfully' };

    } catch (error) {
        console.error("Error in sending new blog post notification:", error);
        return { success: false, message: 'Error generating/sending new blog post notification email', error };
    }
};

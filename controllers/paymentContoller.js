import Stripe from 'stripe'
import SecretKeys from "../secret_key.js";
import Promotion from '../models/Promotion.js';
import Membership from "../models/Membership.js";
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import JWT from "jsonwebtoken";
import MembershipHistory from '../models/MembershipHistory.js';

const stripe = new Stripe(SecretKeys.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
})

export const createPayment = async (req, res) => {
    try {
        const { amount, currency, discountCode } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ success: false, message: "Amount and currency are required" })
        }

        if (currency.toLowerCase() !== 'cad') {
            return res.status(400).json({ success: false, message: "Only CAD payments are supported" })
        }
        let discount_amount = 0;
        let total = amount;
        if (discountCode) {
            const promotion = await Promotion.findOne({ promo_code: discountCode, isActive: true });

            if (!promotion) {
                return res.status(404).json({ success: false, message: "Invalid or expired promotion code." });
            }

            // Check if the promotion is expired
            if (new Date() > new Date(promotion.expiryDate)) {
                return res.status(400).json({ success: false, message: "This promotion code has been expired." });
            }

            discount_amount = Math.floor(amount * (parseFloat(promotion.percentage) / 100) * 100) / 100
            total -= discount_amount;
        }

        // Convert amount to cents (e.g., $10.99 CAD -> 1099)
        const amountInCents = Math.round(parseFloat(total) * 100)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency,
            payment_method_types: ['card'],
        })

        res.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: error });
    }
}


export const updateMembershipPayment = async (req, res) => {
    try {
        // Extract and verify the JWT token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(" ")[1];
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const user_id = decoded._id;

        // Extract data from request body
        const { membership_id, amount, payment_method, transaction_id } = req.body;

        if (!membership_id || !amount || !payment_method || !transaction_id) {
            return res.status(400).json({ message: 'Missing required payment details' });
        }

        // Check if the user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the membership exists
        const membership = await Membership.findById(membership_id);
        if (!membership) {
            return res.status(404).json({ message: 'Membership not found' });
        }


        // Update or create a payment entry
        const payment = new Payment({
            user_id,
            membership_id,
            amount,
            payment_method,
            payment_status: 'successful', // Assuming successful payment
            transaction_id,
        });
        await payment.save();

        let createHistory = true;

        // Determine if the membership is being upgraded, downgraded, or renewed
        let change_type = 'new';
        if (user.membership_id) {
            const previousMembership = await Membership.findById(user.membership_id);
            if (previousMembership) {
                change_type = 'renew';
            }

            // Update the existing membership history record, if it exists
            const existingHistory = await MembershipHistory.findOne({
                user_id,
                new_membership_id: user.membership_id,
            });

            if (existingHistory) {
                createHistory = false;
                existingHistory.change_type = change_type;
                existingHistory.payment_id = payment._id;  // Attach payment ID if applicable
                existingHistory.change_date = new Date();  // Set to current date
                existingHistory.previous_membership_id = user.membership_id;
                existingHistory.new_membership_id = membership_id;
                await existingHistory.save();
            }
        }

        if (createHistory) {
            // Create a new membership history record
            const history = new MembershipHistory({
                user_id,
                new_membership_id: membership_id,
                change_type,
                payment_id: payment._id,  // Attach payment ID if applicable
            });
            await history.save();
        }


        // Update user's membership
        user.membership_id = membership_id;
        await user.save();


        return res.status(200).json({ success: true, message: 'Payment recorded successfully and user membership updated', payment });
    } catch (error) {
        console.error('Error updating payment:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
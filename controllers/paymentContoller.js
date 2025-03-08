import Stripe from 'stripe'
import SecretKeys from "../secret_key.js";
import Promotion from '../models/Promotion.js';

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
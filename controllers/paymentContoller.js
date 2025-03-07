import Stripe from 'stripe'
import SecretKeys from "../secret_key.js";

const stripe = new Stripe(SecretKeys.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
})

export const createPayment = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ success: false, message: "Amount and currency are required" })
        }

        if (currency.toLowerCase() !== 'cad') {
            return res.status(400).json({ success: false, message: "Only CAD payments are supported" })
        }

        // Convert amount to cents (e.g., $10.99 CAD -> 1099)
        const amountInCents = Math.round(parseFloat(amount) * 100)

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
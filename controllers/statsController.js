import User from "../models/User.js";
import Class from "../models/Class.js";
import BlogPost from "../models/BlogPost.js";
import Payment from "../models/Payment.js";

export const getStats = async (req, res) => {
    try {

        const users = await User.countDocuments();
        const classes = await Class.countDocuments();
        const blogs = await BlogPost.countDocuments();
        const result = await Payment.aggregate([
            {
                $match: { payment_status: 'successful' }, // Only include successful payments
            },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: { $toDouble: "$amount" } }, // Convert Decimal128 to number and sum
                },
            },
        ]);

        const totalPayments = result.length > 0 ? result[0].totalPayments : 0;
        return res.status(200).json({ users, classes, blogs, totalPayments });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getPaymentBreakdown = async (req, res) => {
    try {
        const result = await Payment.aggregate([
            {
                $match: { payment_status: 'successful' },
            },
            {
                $group: {
                    _id: '$payment_method',
                    total: { $sum: { $toDouble: '$amount' } },
                },
            },
        ])

        const paymentData = result.reduce((acc, cur) => {
            console.log("A > ", acc, cur);
            acc[cur._id] = cur.total
            return acc
        })

        return res.status(200).json(result)
    } catch (error) {
        console.error('Error fetching payment breakdown:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
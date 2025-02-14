import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// router.use('/users', userRoutes);

router.get("/test", (req, res) => {
    res.send("API is running...");
});

export default router;

import express from 'express';

const router = express.Router();

// router.use('/users', userRoutes);

router.get("/test", (req, res) => {
    res.send("API is running...");
});

export default router;

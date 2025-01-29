import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoString = process.env.DATABASE_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoString);
        console.log('Database Connected');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
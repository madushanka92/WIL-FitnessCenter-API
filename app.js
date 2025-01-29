import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());

connectDB();

app.use(express.json());
app.use('/api', routes);

export default app;

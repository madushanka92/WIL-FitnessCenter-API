import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import multer from "multer";

dotenv.config();
//rest object
const app = express();

app.use(morgan("dev")); // console logs

app.use(cors());

connectDB();
//middlewares
app.use(express.json());
app.use("/api/v1", routes);


// Serve images statically
app.use("/uploads", express.static(path.resolve("uploads")));

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
    next();
});

export default app;

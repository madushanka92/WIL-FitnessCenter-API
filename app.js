import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import cors from "cors";
import morgan from "morgan";

dotenv.config();
//rest object
const app = express();

app.use(morgan("dev")); // console logs

app.use(cors());

connectDB();
//middlewares
app.use(express.json());
app.use("/api/v1", routes);

export default app;

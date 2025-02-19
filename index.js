import dotenv from "dotenv";
import app from "./app.js"; // Use .js extension for ES module imports
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Fit & Thrive</h1>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

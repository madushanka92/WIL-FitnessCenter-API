import dotenv from 'dotenv';
import app from './app.js';  // Use .js extension for ES module imports

dotenv.config();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

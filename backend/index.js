import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import gameResultsRoutes from './routes/gameResultsRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import creditRoutes from "./routes/creditRoutes.js";
import commission from "./routes/commissionRoutes.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

// Enable CORS with credentials for your frontend URLs
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:3000"], 
  credentials: true 
}));

// API route mounting
app.use("/api/auth", authRoutes);
app.use("/api/game-results", gameResultsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api", creditRoutes);
app.use("/api/commission", commission);
// Serve React static files
app.use(express.static(path.join(__dirname, 'build')));

// Fallback for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

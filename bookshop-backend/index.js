// Correct Order in index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import genvex from "genv-ex";
import bookRoutes from "./routes/bookRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

genvex();

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());
// MongoDB Connection with retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: "majority",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
connectDB();

// ✅ Static files
app.use("/uploads", express.static("uploads"));

// ✅ Your API routes
app.use("/api/books", bookRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Dummy root route
app.get("/", (req, res) => {
  res.send("📚 Bookshop API is running");
});

app.get("/whoami", (req, res) => res.send("🧪 I am the Example API"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

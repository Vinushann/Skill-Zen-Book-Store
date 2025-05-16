// models/Book.js
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: String,
  coverImage: { type: String }, // Stores image file path (e.g., /uploads/book1.jpg)
});

export default mongoose.model("Book", bookSchema);

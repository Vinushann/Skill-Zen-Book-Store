// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String }, // Optional if user system is added later
  books: [
    {
      bookId: String,
      title: String,
      quantity: Number,
      price: Number,
    },
  ],
  delivery: {
    fullName: String,
    phone: String,
    address1: String,
    address2: String,
    city: String,
    postalCode: String,
    country: String,
  },
  totalAmount: Number,
  paymentId: String,
  orderDate: { type: Date, default: Date.now },
  orderStatus: { type: String, default: "Processing" },
});

export default mongoose.model("Order", orderSchema);

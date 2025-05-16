// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getUserOrders); // Optional: all orders
router.put("/cancel/:id", cancelOrder); // ✅ Add cancel route

export default router;

// controllers/orderController.js
import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { cart, delivery, paymentId, totalAmount } = req.body;

    const books = cart.map((item) => ({
      bookId: item._id,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
    }));

    const order = new Order({
      books,
      delivery,
      totalAmount,
      paymentId,
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel an order by ID
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Optionally, only allow cancelling if status is not already cancelled or shipped
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    if (order.orderStatus === "Shipped") {
      return res.status(400).json({ message: "Cannot cancel a shipped order" });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

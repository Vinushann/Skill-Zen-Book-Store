import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    price
  );

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchParams] = useSearchParams();

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5002/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "success") {
      const cart = JSON.parse(localStorage.getItem("cart"));
      const delivery = JSON.parse(sessionStorage.getItem("delivery"));
      const totalAmount = cart.reduce((t, i) => t + i.quantity * i.price, 0);
      const paymentId = "STRIPE_PLACEHOLDER"; // Ideally from backend/webhook

      axios.post("http://localhost:5002/api/orders", {
        cart,
        delivery,
        paymentId,
        totalAmount,
      });

      localStorage.removeItem("cart");
      sessionStorage.removeItem("delivery");
    }

    fetchOrders();
  }, [searchParams]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.put(`http://localhost:5002/api/orders/cancel/${orderId}`);
      alert("🛑 Order cancelled");
      fetchOrders(); // Refresh after cancellation
    } catch (err) {
      console.error(
        "Failed to cancel order:",
        err.response?.data?.message || err.message
      );
      alert("⚠️ Failed to cancel order");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900 tracking-tight">
        📦 My Orders
      </h1>


      {orders.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-24">
          You have no orders yet.
        </p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const isCancelable = !["cancelled", "delivered"].includes(
              order.orderStatus?.toLowerCase()
            );

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 md:mb-0">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium tracking-wide">
                    Placed on {formatDate(order.orderDate)}
                  </p>
                </div>

                {/* Status badge */}
                <p className="mb-6">
                  Status:{" "}
                  <span
                    className={`inline-block px-4 py-1 rounded-full font-semibold text-sm tracking-wide ${
                      statusColors[order.orderStatus?.toLowerCase()] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.orderStatus || "Unknown"}
                  </span>
                </p>

                {/* Delivery info */}
                {order.delivery && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-300 pb-1">
                      Delivery Information
                    </h3>
                    <div className="space-y-1 text-gray-700 leading-relaxed max-w-md">
                      <p>{order.delivery.fullName}</p>
                      <p>
                        {order.delivery.address1}
                        {order.delivery.address2 &&
                          `, ${order.delivery.address2}`}
                      </p>
                      <p>
                        {order.delivery.city}, {order.delivery.postalCode}
                      </p>
                      <p>{order.delivery.country}</p>
                      <p>Phone: {order.delivery.phone}</p>
                    </div>
                  </div>
                )}

                {/* Payment ID */}
                {order.paymentId && (
                  <p className="mb-6 text-gray-600 text-sm font-mono">
                    Payment ID: <code>{order.paymentId}</code>
                  </p>
                )}

                {/* Books list */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-1">
                    Books Ordered
                  </h3>
                  <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
                    {order.books.map((b, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center border-b last:border-b-0 px-6 py-3"
                      >
                        <div className="max-w-xs truncate">
                          <p className="font-semibold text-gray-900 truncate">
                            {b.title}
                          </p>
                          <p className="text-gray-600 text-sm truncate">
                            {b.author}
                          </p>
                        </div>
                        <div className="text-right min-w-[110px] text-gray-900">
                          <p className="text-sm">
                            {b.quantity} × {formatPrice(b.price)}
                          </p>
                          <p className="font-semibold">
                            {formatPrice(b.price * b.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="text-right text-2xl font-extrabold text-gray-900 tracking-wide mb-6">
                  Total Paid: {formatPrice(order.totalAmount)}
                </div>

                {/* Cancel button */}
                {isCancelable && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    aria-label={`Cancel order ${order._id}`}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

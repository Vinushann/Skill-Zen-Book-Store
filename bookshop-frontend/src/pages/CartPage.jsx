import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const updateCart = (updated) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const increase = (bookId) => {
    const updated = cart.map((item) =>
      item._id === bookId ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updated);
  };

  const decrease = (bookId) => {
    const updated = cart.map((item) =>
      item._id === bookId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    updateCart(updated);
  };

  const removeItem = (bookId) => {
    const updated = cart.filter((item) => item._id !== bookId);
    updateCart(updated);
  };

  const clearCart = () => {
    if (
      window.confirm(
        "Are you sure you want to clear your cart? This action cannot be undone."
      )
    ) {
      localStorage.removeItem("cart");
      setCart([]);
    }
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex justify-between items-center">
        🛒 Your Cart
        <span className="text-sm text-gray-600">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </span>
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-lg"
              >
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-gray-700">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                  <p className="font-bold">
                    Subtotal: {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => decrease(item._id)}
                    disabled={item.quantity === 1}
                    className={`px-3 py-1 rounded ${
                      item.quantity === 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    } transition`}
                    aria-label={`Decrease quantity of ${item.title}`}
                  >
                    −
                  </button>
                  <span className="min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increase(item._id)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    aria-label={`Increase quantity of ${item.title}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="ml-4 px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-100 transition"
                    aria-label={`Remove ${item.title} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-right sticky bottom-0 bg-gray-50 p-4 rounded-t-lg shadow-md sm:shadow-none">
            <h3 className="text-xl font-bold">
              Total: {formatPrice(totalPrice)}
            </h3>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={clearCart}
                className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300 transition"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate("/checkout")}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;

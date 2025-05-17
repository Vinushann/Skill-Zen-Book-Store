import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [delivery, setDelivery] = useState({
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // Check for successful payment
    const query = new URLSearchParams(location.search);
    if (query.get("success") === "true") {
      // Clear cart and redirect to homepage
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/", { replace: true });
    }

    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validate = () => {
    const newErrors = {};
    if (!delivery.fullName.trim())
      newErrors.fullName = "Full Name is required.";
    if (!delivery.phone.trim()) newErrors.phone = "Phone Number is required.";
    if (!delivery.address1.trim())
      newErrors.address1 = "Address Line 1 is required.";
    if (!delivery.city.trim()) newErrors.city = "City is required.";
    if (!delivery.postalCode.trim())
      newErrors.postalCode = "Postal Code is required.";
    if (!delivery.country.trim()) newErrors.country = "Country is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setDelivery({ ...delivery, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    setOrderError(null);

    try {
      const res = await axios.post("http://localhost:5002/api/checkout", {
        cart,
        delivery,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setOrderError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setOrderError("Error placing order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Form */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePlaceOrder();
            }}
            noValidate
            aria-label="Delivery details form"
          >
            {[
              { label: "Full Name", name: "fullName", type: "text" },
              { label: "Phone Number", name: "phone", type: "tel" },
              { label: "Address Line 1", name: "address1", type: "text" },
              { label: "Address Line 2", name: "address2", type: "text" },
              { label: "City", name: "city", type: "text" },
              { label: "Postal Code", name: "postalCode", type: "text" },
              { label: "Country", name: "country", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="mb-4">
                <label
                  htmlFor={name}
                  className="block mb-1 font-medium text-gray-700"
                >
                  {label}
                  {name !== "address2" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={delivery[name]}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600 ${
                    errors[name] ? "border-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={errors[name] ? "true" : "false"}
                  aria-describedby={errors[name] ? `${name}-error` : undefined}
                  required={name !== "address2"}
                />
                {errors[name] && (
                  <p
                    id={`${name}-error`}
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                  >
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}

            {orderError && (
              <p className="text-red-600 mb-4" role="alert">
                {orderError}
              </p>
            )}
          </form>
        </div>

        {/* Cart Summary */}
        <div className="bg-white p-6 rounded shadow flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>
          <div className="flex-grow overflow-y-auto max-h-[60vh]">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between mb-3">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4 font-bold text-right">
            Total: {formatPrice(totalPrice)}
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Processing..." : "Place Order & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

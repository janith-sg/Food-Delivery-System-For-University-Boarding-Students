import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const Checkout = ({ onBack }) => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    paymentMethod: "Cash on Delivery",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const deliveryFee = cartItems.length > 0 ? 400 : 0;
  const subTotal = getCartTotal();
  const finalTotal = subTotal + deliveryFee;

  // Validation rules
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters.";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = "Name can only contain letters and spaces.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^0[0-9]{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Sri Lankan phone number (e.g. 0771234567).";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Delivery address is required.";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a more detailed address (min. 10 characters).";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePlaceOrder = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          note: formData.note.trim(),
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems,
        subTotal,
        deliveryFee,
        total: finalTotal,
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        clearCart();
      } else {
        alert(data?.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-5 rounded-2xl bg-white shadow-md p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">
          ✅
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Your order has been received. We'll deliver it to your boarding room shortly.
          </p>
        </div>
        <button
          onClick={onBack}
          className="mt-2 rounded-xl bg-green-600 px-8 py-3 text-sm font-bold text-white hover:bg-green-700 transition border-none cursor-pointer"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-md overflow-hidden">
      {/* Page Header */}
      <div className="bg-green-600 px-6 py-5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition border-none cursor-pointer"
        >
          ←
        </button>
        <div>
          <p className="text-green-100 text-xs font-semibold uppercase tracking-widest">
            Almost there
          </p>
          <h2 className="text-xl font-extrabold text-white">Checkout</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-5">

            {/* Delivery Details */}
            <div>
              <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                📦 Delivery Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Kavindu Perera"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                      ${errors.fullName
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white"
                      }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0771234567"
                    maxLength={10}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                      ${errors.phone
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white"
                      }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Room / Boarding Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Room 204, Block B, University Hostel, Colombo"
                  rows={3}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition resize-none
                    ${errors.address
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white"
                    }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                💳 Payment Method
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                {["Cash on Delivery", "Card Payment"].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 flex-1 rounded-xl border-2 px-4 py-3 cursor-pointer transition
                      ${formData.paymentMethod === method
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-green-200"
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={handleChange}
                      className="accent-green-600"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      {method === "Cash on Delivery" ? "💵 " : "💳 "}
                      {method}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Note */}
            <div>
              <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                📝 Special Note <span className="text-gray-400 font-normal normal-case tracking-normal">(Optional)</span>
              </h3>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Any special instructions? (e.g. extra spicy, no onions)"
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 sticky top-5">
              <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">
                🧾 Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-semibold text-gray-800">
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs. {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-green-700">Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`mt-5 w-full rounded-xl py-3.5 text-sm font-extrabold text-white transition-all duration-200 border-none cursor-pointer shadow-md shadow-green-200
                  ${loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 active:scale-95"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  "Place Order 🎉"
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Safe & secure for boarding students
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

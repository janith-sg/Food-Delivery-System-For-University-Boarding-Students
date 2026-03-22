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

  const deliveryFee = cartItems.length > 0 ? 400 : 0;
  const finalTotal = getCartTotal() + deliveryFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    const orderData = {
      customer: formData,
      items: cartItems,
      subTotal: getCartTotal(),
      deliveryFee,
      total: finalTotal,
    };

    console.log("Order Placed:", orderData);

    clearCart();

    alert("🎉 Order placed successfully!");
  };

  return (
    <div className="mt-5 rounded-2xl bg-white p-6 shadow-md">
      <button
        onClick={onBack}
        className="mb-5 rounded-lg bg-gray-200 px-4 py-2.5 font-bold text-gray-900 transition hover:bg-gray-300 border-none "
      >
        Back to Menu
      </button>

      <h2 className="mb-5 text-2xl font-bold text-gray-800">Checkout</h2>

      <form onSubmit={handlePlaceOrder} className="max-w-[700px]">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-bold text-gray-800">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none transition focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-bold text-gray-800">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none transition focus:border-green-600"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block font-bold text-gray-800">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="3"
            className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none transition focus:border-green-600"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block font-bold text-gray-800">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none transition focus:border-green-600"
          >
            <option>Cash on Delivery</option>
            <option>Card Payment</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block font-bold text-gray-800">
            Special Note
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none transition focus:border-green-600"
          />
        </div>

        <div className="mb-5 rounded-xl bg-gray-50 p-4">
          <p className="mb-2 text-gray-600">Sub Total: Rs. {getCartTotal()}</p>
          <p className="mb-2 text-gray-600">Delivery Fee: Rs. {deliveryFee}</p>
          <h3 className="text-xl font-bold text-black">
            Final Total: Rs. {finalTotal}
          </h3>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-green-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-green-700 border-none"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
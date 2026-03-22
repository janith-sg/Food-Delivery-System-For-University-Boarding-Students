import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const Cart = ({ onCheckout }) => {
  const { cartItems, addToCart, decreaseQty, removeFromCart, getCartTotal } =
    useContext(CartContext);

  const deliveryFee = cartItems.length > 0 ? 400 : 0;
  const finalTotal = getCartTotal() + deliveryFee;

  return (
    <div className="sticky top-5 rounded-2xl bg-white p-5 shadow-md">
      <h2 className="mb-5 text-2xl font-bold text-gray-800">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} className="mb-4 border-b border-gray-200 pb-4">
              <h4 className="mb-2 text-lg font-semibold text-gray-800">
                {item.name}
              </h4>

              <p className="mb-2 text-gray-500">Price: Rs. {item.price}</p>

              <p className="mb-3 text-gray-500">Quantity: {item.qty}</p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => addToCart(item)}
                  className="rounded-lg bg-green-600 px-3.5 py-2 font-bold text-white transition hover:bg-green-700 border-none"
                >
                  +
                </button>

                <button
                  onClick={() => decreaseQty(item.id)}
                  className="rounded-lg bg-gray-700 px-3.5 py-2 font-bold text-white transition hover:bg-gray-800"
                >
                  -
                </button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-lg bg-gray-200 px-3.5 py-2 font-bold text-gray-900 transition hover:bg-gray-300 border-none"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-5 border-t-2 border-gray-200 pt-4">
            <p className="mb-2 text-gray-600">Sub Total: Rs. {getCartTotal()}</p>

            <p className="mb-2 text-gray-600">Delivery Fee: Rs. {deliveryFee}</p>

            <h3 className="mb-4 text-xl font-bold text-black">
              Total: Rs. {finalTotal}
            </h3>

            <button
              onClick={onCheckout}
              className="w-full rounded-xl bg-green-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-green-700 border-none"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
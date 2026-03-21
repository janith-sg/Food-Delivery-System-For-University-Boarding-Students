import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const Cart = () => {
  const { cartItems, addToCart, decreaseQty, removeFromCart, getCartTotal } =
    useContext(CartContext);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h4>{item.name}</h4>
            <p>Price: Rs. {item.price}</p>
            <p>Quantity: {item.qty}</p>

            <button onClick={() => addToCart(item)}>+</button>
            <button onClick={() => decreaseQty(item.id)} style={{ marginLeft: "10px" }}>
              -
            </button>
            <button
              onClick={() => removeFromCart(item.id)}
              style={{ marginLeft: "10px" }}
            >
              Remove
            </button>
          </div>
        ))
      )}

      <h3>Total: Rs. {getCartTotal()}</h3>
    </div>
  );
};

export default Cart;
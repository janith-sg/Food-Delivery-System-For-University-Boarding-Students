
import React, { useState } from "react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Bucket / 6PC",
      price: 3750,
      quantity: 1,
    },
    {
      id: 2,
      name: "Quarter / 2Pc",
      price: 1400,
      quantity: 1,
    },
  ]);

  const increaseQty = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updated);
  };

  const decreaseQty = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updated);
  };

  const getTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart</h2>

      {cartItems.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h4>{item.name}</h4>
          <p>Price: Rs. {item.price}</p>
          <p>Quantity: {item.quantity}</p>

          <button onClick={() => increaseQty(item.id)}>+</button>
          <button onClick={() => decreaseQty(item.id)}>-</button>
        </div>
      ))}

      <h3>Total: Rs. {getTotal()}</h3>
    </div>
  );
};

export default Cart;
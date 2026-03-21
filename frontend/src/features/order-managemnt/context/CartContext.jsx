import { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      const updatedCart = cartItems.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, qty: cartItem.qty + 1 }
          : cartItem
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...item, qty: 1 }]);
    }
  };

  const decreaseQty = (id) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === id);

    if (!existingItem) return;

    if (existingItem.qty === 1) {
      removeFromCart(id);
    } else {
      const updatedCart = cartItems.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, qty: cartItem.qty - 1 }
          : cartItem
      );
      setCartItems(updatedCart);
    }
  };

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((cartItem) => cartItem.id !== id);
    setCartItems(updatedCart);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.qty,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decreaseQty,
        removeFromCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
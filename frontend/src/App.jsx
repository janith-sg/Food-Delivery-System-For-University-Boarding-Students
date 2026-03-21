import React from "react";
import { CartProvider } from "./features/order-managemnt/context/CartContext";
import Menu from "./features/order-managemnt/pages/Menu";
import Cart from "./features/order-managemnt/pages/Cart";

function App() {
  return (
    <CartProvider>
      <Menu />
      <Cart />
    </CartProvider>
  );
}

export default App;
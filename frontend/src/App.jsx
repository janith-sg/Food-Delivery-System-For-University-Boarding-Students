import React from "react";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      {/* your routes/components */}
    </CartProvider>
  );
}

export default App;
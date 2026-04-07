import React, { useState } from "react";
import Menu from "./Menu";
import Cart from "./Cart";
import Checkout from "./Checkout";

const OrderManagement = () => {
  const [showCheckout, setShowCheckout] = useState(false);

  if (showCheckout) {
    return (
      <main className="font-sans min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <Checkout onBack={() => setShowCheckout(false)} />
        </div>
      </main>
    );
  }

  return (
    <main className="font-sans min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Order Management</h1>
          <p className="mt-1 text-sm text-slate-600">Add items to cart and proceed to checkout.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section>
            <Menu />
          </section>

          <aside>
            <Cart onCheckout={() => setShowCheckout(true)} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default OrderManagement;

import React, { useState } from "react";
import { CartProvider } from "./features/order-managemnt/context/CartContext";
import Menu from "./features/order-managemnt/pages/Menu";
import Cart from "./features/order-managemnt/pages/Cart";
import Checkout from "./features/order-managemnt/pages/Checkout";
import GroupOrder from "./features/order-managemnt/pages/GroupOrder";
import GroupMenu from "./features/order-managemnt/pages/GroupMenu";
import "./App.css";
import GroupSummary from "./features/order-managemnt/pages/GroupSummary";

function App() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showGroupOrder, setShowGroupOrder] = useState(false);

  const [groupCode, setGroupCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [groupJoined, setGroupJoined] = useState(false);
  const [groupView, setGroupView] = useState("menu"); // menu | summary

  const handleEnterGroup = (code, name) => {
    setGroupCode(code);
    setMemberName(name);
    setGroupJoined(true);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mb-5 flex gap-3">
          <button
            onClick={() => {
              setShowGroupOrder(false);
              setShowCheckout(false);
            }}
            className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
          >
            Food Order
          </button>

          <button
            onClick={() => {
              setShowGroupOrder(true);
              setShowCheckout(false);
              setGroupJoined(false);
            }}
            className="rounded-lg bg-gray-900 px-4 py-2 font-bold text-white hover:bg-black"
          >
            Group Order
          </button>
        </div>

        {showGroupOrder ? (
          !groupJoined ? (
            <GroupOrder
  onEnterGroup={handleEnterGroup}
  onBack={() => setShowGroupOrder(false)}
/>
          ) : (
          groupView === "menu" ? (
  <GroupMenu
    groupCode={groupCode}
    memberName={memberName}
    onBackToGroups={() => setGroupJoined(false)}
    onViewSummary={() => setGroupView("summary")}
  />
) : (
  <GroupSummary
    groupCode={groupCode}
    memberName={memberName}
    onBack={() => setGroupView("menu")}
  />
)
          )
        ) : !showCheckout ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
            <Menu />
            <Cart onCheckout={() => setShowCheckout(true)} />
          </div>
        ) : (
          <Checkout onBack={() => setShowCheckout(false)} />
        )}
      </div>
    </CartProvider>
  );
}

export default App;
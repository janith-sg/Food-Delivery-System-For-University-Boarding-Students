
import React, { useEffect, useState } from "react";

const GroupCart = ({ groupCode, onBack }) => {
  const [groupData, setGroupData] = useState(null);

  const fetchGroup = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/group-orders/${groupCode}`
      );
      const data = await res.json();

      if (res.ok) {
        setGroupData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const items = groupData?.items || [];
  const totalItems = items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const deliveryFee = items.length > 0 ? groupData?.deliveryFee || 200 : 0;
  const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal = subTotal + deliveryFee;

  return (
    <div className="font-sans sticky top-5 rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden">
      {/* Cart Header */}
      <div className="bg-green-600 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          <h2 className="text-lg font-extrabold text-white">Group Cart</h2>
        </div>
        {totalItems > 0 && (
          <span className="bg-white text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {totalItems} item{totalItems > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="p-5">
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
              🍽️
            </div>
            <p className="font-semibold text-gray-700">Your cart is empty</p>
            <p className="text-sm text-gray-400">Add items from the menu to get started</p>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex flex-col gap-3 mb-5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Rs. {item.price.toLocaleString()} each
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-green-700 whitespace-nowrap">
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden px-2 py-1">
                      <span className="w-7 text-center text-sm font-bold text-gray-900">
                        {item.qty}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-semibold">Added by {item.addedBy}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">Rs. {subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold">Rs. {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-green-200 pt-2 flex justify-between">
                <span className="font-extrabold text-gray-900">Total</span>
                <span className="font-extrabold text-green-700 text-lg">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onBack}
              className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-extrabold text-white hover:bg-green-700 active:scale-95 transition-all duration-200 border-none cursor-pointer shadow-md shadow-green-200"
            >
              Back to Menu →
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              🔒 Secure order for boarding students
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupCart;

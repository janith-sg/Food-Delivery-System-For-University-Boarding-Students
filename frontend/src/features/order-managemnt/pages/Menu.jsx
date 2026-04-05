import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const dummyItems = [
  {
    id: 1,
    name: "Bucket / 6PC",
    price: 3750,
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80",
    description: "Hot and crispy chicken bucket for sharing.",
    tag: "Popular",
  },
  {
    id: 2,
    name: "Quarter / 2Pc",
    price: 1400,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
    description: "2 pieces of signature crispy chicken.",
    tag: "Budget Pick",
  },
  {
    id: 3,
    name: "Half / 4Pc",
    price: 2600,
    image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80",
    description: "4 pieces of crispy chicken for a small meal.",
    tag: "Best Value",
  },
  {
    id: 4,
    name: "Full / 8Pc",
    price: 4950,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80",
    description: "8 pieces of signature crispy chicken.",
    tag: "Family Size",
  },
];

const tagColors = {
  Popular: "bg-amber-100 text-amber-700",
  "Budget Pick": "bg-sky-100 text-sky-700",
  "Best Value": "bg-emerald-100 text-emerald-700",
  "Family Size": "bg-purple-100 text-purple-700",
};

const Menu = () => {
  const { addToCart, cartItems } = useContext(CartContext);
  const [added, setAdded] = useState({});

  const handleAdd = (item) => {
    addToCart(item);
    setAdded((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [item.id]: false })), 1200);
  };

  const getQty = (id) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.qty : 0;
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-1">
            UNI EATS
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Today's Menu 🍗
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
          <span className="text-sm font-semibold text-green-700">Kitchen Open</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {dummyItems.map((item) => {
          const qty = getQty(item.id);
          const isAdded = added[item.id];
          return (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-44">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Tag */}
                <span
                  className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${tagColors[item.tag]}`}
                >
                  {item.tag}
                </span>
                {/* Qty badge */}
                {qty > 0 && (
                  <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {qty}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4 gap-2">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 flex-1 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-extrabold text-gray-900">
                    Rs.{" "}
                    <span className="text-green-700">{item.price.toLocaleString()}</span>
                  </span>
                </div>
                <button
                  onClick={() => handleAdd(item)}
                  className={`mt-1 w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-300 border-none cursor-pointer
                    ${isAdded
                      ? "bg-green-100 text-green-700 scale-95"
                      : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                    }`}
                >
                  {isAdded ? "✓ Added!" : "+ Add to Cart"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;

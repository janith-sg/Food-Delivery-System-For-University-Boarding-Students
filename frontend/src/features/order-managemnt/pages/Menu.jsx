import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const dummyItems = [
  {
    id: 1,
    name: "Bucket / 6PC",
    price: 3750,
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80",
    description: "Hot and crispy chicken bucket for sharing.",
  },
  {
    id: 2,
    name: "Quarter / 2Pc",
    price: 1400,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
    description: "2 pieces of signature crispy chicken.",
  },
  {
    id: 3,
    name: "Half / 4Pc",
    price: 2600,
    image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80",
    description: "4 pieces of crispy chicken for a small meal.",
  },
  {
    id: 4,
    name: "Full / 8Pc",
    price: 4950,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80",
    description: "8 pieces of signature crispy chicken.",
  },
];

const Menu = () => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="mb-5 rounded-2xl bg-white p-5 shadow-md">
      <h2 className="mb-5 text-2xl font-bold text-gray-800">Food Menu</h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
        {dummyItems.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-[180px] w-full object-cover"
            />

            <div className="p-4">
              <h3 className="mb-2.5 text-xl font-semibold text-gray-800">
                {item.name}
              </h3>

              <p className="mb-3 min-h-[40px] text-sm text-gray-500">
                {item.description}
              </p>

              <p className="mb-3.5 text-lg font-bold text-black">
                Rs. {item.price}
              </p>

              <button
                onClick={() => addToCart(item)}
                className="w-full cursor-pointer rounded-xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 border-none"
              >
                Add to Bucket
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
import React from "react";
import { Flame, Leaf, Package, Tag } from "lucide-react";
import { getImageUrl } from "../api";

function formatCurrency(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

export default function FoodCard({ item, disabledOutOfStock, showAddToCart = false, onAddToCart, onImageClick }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-white/45 bg-white/75 shadow-lg shadow-slate-900/5 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
        disabledOutOfStock ? "opacity-65 grayscale-[0.2]" : ""
      }`}
    >
      <div className="relative h-44 overflow-hidden cursor-pointer" onClick={onImageClick}>
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          onError={(event) => {
            event.currentTarget.src = "https://placehold.co/640x420?text=Food+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {item.isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              <Flame size={12} />
              Popular
            </span>
          )}
          {item.isBudgetFriendly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              Budget
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-500">{item.category}</p>
          </div>
          <span className="rounded-full bg-green-700 px-2.5 py-1 text-xs font-medium text-white">{formatCurrency(item.price)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-medium text-lime-900">
            <Tag size={12} />
            {item.portion || "Standard"}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${item.isOutOfStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
            <Package size={12} />
            {item.isOutOfStock ? "Out of Stock" : "Available"}
          </span>
          {item.type?.toLowerCase().includes("veg") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
              <Leaf size={12} />
              Vegetarian
            </span>
          )}
          {item.lowStock && !item.isOutOfStock && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
              Low Stock
            </span>
          )}
        </div>

        {showAddToCart && (
          <button
            type="button"
            disabled={item.isOutOfStock}
            onClick={onAddToCart}
            className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
              item.isOutOfStock
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-green-700 text-white hover:bg-green-800"
            }`}
          >
            {item.isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  );
}

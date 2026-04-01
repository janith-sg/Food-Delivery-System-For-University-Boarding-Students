import React from "react";
import { ChevronLeft, X } from "lucide-react";
import { getImageUrl } from "../api";

function formatCurrency(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function showValue(value, fallback = "Not provided") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

export default function FoodDetailsModal({ item, onClose, onBack }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header with back/close buttons */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Hero Image */}
          <div className="overflow-hidden rounded-2xl">
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="h-64 w-full object-cover sm:h-80"
              onError={(event) => {
                event.currentTarget.src = "https://placehold.co/640x420?text=Food+Image";
              }}
            />
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
            <p className="mt-1 text-lg font-semibold text-green-600">
              {formatCurrency(item.price)}
            </p>
            <p className="text-sm text-slate-500">{item.category}</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-600">Calories</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{showValue(item.calories)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-600">Protein</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{showValue(item.protein)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-600">Prep Time</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{showValue(item.preparationTime)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-600">Spice Level</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {item.spiceLevel === "Mild" && "🌶 Mild"}
                {item.spiceLevel === "Medium" && "🌶🌶 Medium"}
                {item.spiceLevel === "Hot" && "🌶🌶🌶 Hot"}
                {item.spiceLevel === "Very Hot" && "🌶🌶🌶🌶 Very Hot"}
                {!item.spiceLevel && "Not provided"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-600">Diet Type</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{showValue(item.dietType)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-600">Serving</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{showValue(item.servingType)}</p>
            </div>
          </div>

          {/* Details Sections */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <h3 className="font-bold text-slate-900">Ingredients</h3>
              <p className="mt-2 text-sm text-slate-700">{showValue(item.ingredients)}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">Portion Size</h3>
              <p className="mt-2 text-sm text-slate-700">{showValue(item.portionSize)}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">Best Before</h3>
              <p className="mt-2 text-sm text-slate-700">{showValue(item.bestBefore)}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">Description</h3>
              <p className="mt-2 text-sm text-slate-700">{showValue(item.description)}</p>
            </div>
          </div>

          {/* Stock Status */}
          <div className="border-t border-slate-200 pt-4">
            <div
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                item.isOutOfStock
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {item.isOutOfStock ? "Out of Stock" : "In Stock"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const categoryFilters = ["All", "Breakfast", "Lunch", "Dinner", "Vegetarian", "Budget Meals"];

export default function FilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  budgetOnly,
  onBudgetToggle,
  hideOutOfStock,
  onOutOfStockToggle,
  scheduleOnly,
  onScheduleToggle,
  currentMealLabel,
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-green-100 bg-white p-5 shadow-lg shadow-green-900/5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by food name"
          className="w-full rounded-2xl border border-green-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categoryFilters.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
              selectedCategory === category
                ? "bg-green-700 text-white shadow"
                : "bg-green-50 text-green-800 hover:bg-green-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-2 font-semibold text-green-700">
          <SlidersHorizontal size={14} />
          Smart Filters
        </span>

        <button
          type="button"
          onClick={onBudgetToggle}
          className={`rounded-full px-3 py-2 font-medium transition ${
            budgetOnly ? "bg-green-600 text-white" : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Budget-friendly
        </button>

        <button
          type="button"
          onClick={onOutOfStockToggle}
          className={`rounded-full px-3 py-2 font-medium transition ${
            hideOutOfStock ? "bg-lime-600 text-white" : "bg-lime-100 text-lime-800 hover:bg-lime-200"
          }`}
        >
          Hide out-of-stock
        </button>

        <button
          type="button"
          onClick={onScheduleToggle}
          className={`rounded-full px-3 py-2 font-medium transition ${
            scheduleOnly ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-800 hover:bg-teal-200"
          }`}
        >
          Show {currentMealLabel}
        </button>
      </div>
    </section>
  );
}

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const categoryFilters = ["All", "Breakfast", "Lunch", "Dinner", "Vegetarian", "Budget Meals"];

export default function FilterBar({
  isDarkMode = false,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  budgetOnly,
  onBudgetToggle,
  hideOutOfStock,
  onOutOfStockToggle,
  scheduleOnly,
  onScheduleToggle,
  currentMealLabel,
}) {
  return (
    <section className={`space-y-4 rounded-3xl border p-5 shadow-lg ${isDarkMode ? "border-slate-700 bg-slate-900/90 shadow-black/20" : "border-green-100 bg-white shadow-green-900/5"}`}>
      <div className="relative">
        <Search className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by food name"
          className={`w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none transition ${isDarkMode ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20" : "border-green-200 bg-white text-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="sort-menu" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sort Menu
        </label>
        <select
          id="sort-menu"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
          className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition sm:w-64 ${isDarkMode ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-green-500" : "border-green-200 bg-white text-slate-700 focus:border-green-500"}`}
        >
          <option value="PRICE_ASC">Price Low to High</option>
          <option value="PRICE_DESC">Price High to Low</option>
          <option value="HIGHEST_RATED">Highest Rated</option>
        </select>
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
                : isDarkMode
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
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

import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

const defaultForm = {
  foodID: "",
  name: "",
  category: "Breakfast",
  price: "",
  stock: "",
  type: "Regular",
  portion: "Regular",
  image: "",
  description: "",
  protein: "",
  calories: "",
  ingredients: "",
  spiceLevel: "Mild",
  portionSize: "",
  bestBefore: "",
  preparationTime: "",
  dietType: "Vegetarian",
  servingType: "Hot meal",
};

const FOOD_ID_PREFIX = "F";
const FOOD_ID_MIN_NUMBER = 1001;
const PRICE_MAX_LKR = 10000;

function normalizeFoodIdValue(value = "") {
  return String(value).trim().toUpperCase();
}

function parseFoodIdNumber(value = "") {
  const match = normalizeFoodIdValue(value).match(/^F(\d+)$/);
  return match ? Number(match[1]) : null;
}

function getNextFoodId(items = []) {
  let maxFoodId = FOOD_ID_MIN_NUMBER - 1;

  items.forEach((item) => {
    const parsedNumber = parseFoodIdNumber(item.foodID || item.FoodID || "");
    if (parsedNumber !== null && parsedNumber > maxFoodId) {
      maxFoodId = parsedNumber;
    }
  });

  const nextNumber = Math.max(maxFoodId + 1, FOOD_ID_MIN_NUMBER);
  return `${FOOD_ID_PREFIX}${nextNumber}`;
}

function getDefaultForm(initialCategory = "Breakfast", nextFoodId = "") {
  return {
    ...defaultForm,
    category: initialCategory,
    foodID: nextFoodId,
  };
}

function parseRsPrice(value = "") {
  const normalized = String(value).trim();
  const match = normalized.match(/^Rs\s*(\d+(?:\.\d{2})?)$/i);
  if (!match) return null;
  return Number(match[1]);
}

function formatRsPrice(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "";
  return `Rs${numericValue.toFixed(2)}`;
}

function validateForm(form, items, editingId, imageFile) {
  const errors = [];
  if (!form.foodID?.trim()) errors.push("Food ID is required");
  if (!/^F\d+$/.test(normalizeFoodIdValue(form.foodID))) {
    errors.push("Food ID format must be like F1001");
  }
  if (!form.name?.trim()) errors.push("Name is required");
  if (!form.category?.trim()) errors.push("Category is required");
  const parsedPrice = parseRsPrice(form.price);
  if (parsedPrice === null) {
    errors.push("Price format must be like Rs10.00");
  } else {
    if (parsedPrice <= 0) errors.push("Price must be greater than Rs0.00");
    if (parsedPrice > PRICE_MAX_LKR) errors.push("Price cannot be more than Rs10000.00");
  }
  if (!form.stock?.trim()) errors.push("Stock is required");
  if (!form.type?.trim()) errors.push("Type is required");
  if (!form.portion?.trim()) errors.push("Portion is required");
  if (!form.description?.trim()) errors.push("Description is required");
  if (!form.protein?.trim()) errors.push("Protein is required");
  if (!form.calories?.trim()) errors.push("Calories is required");
  if (!form.ingredients?.trim()) errors.push("Ingredients are required");
  if (!form.spiceLevel?.trim()) errors.push("Spice level is required");
  if (!form.portionSize?.trim()) errors.push("Portion size detail is required");
  if (!form.bestBefore?.trim()) errors.push("Best before detail is required");
  if (!form.preparationTime?.trim()) errors.push("Preparation time is required");
  if (!form.dietType?.trim()) errors.push("Diet type is required");
  if (!form.servingType?.trim()) errors.push("Serving type is required");
  if (!imageFile && !form.image?.trim()) {
    errors.push("Food photo is required");
  }

  const normalizedFormId = normalizeFoodIdValue(form.foodID);
  const hasDuplicate = items.some((item) => {
    if (editingId && item._id === editingId) return false;
    return normalizeFoodIdValue(item.foodID || item.FoodID || "") === normalizedFormId;
  });

  if (hasDuplicate) {
    errors.push(`Food ID ${normalizedFormId} already exists`);
  }

  return errors;
}

function buildPayload(form, imageFile) {
  const parsedPrice = parseRsPrice(form.price);
  const payload = new FormData();
  payload.append("foodID", form.foodID.trim());
  payload.append("name", form.name.trim());
  payload.append("category", form.category);
  payload.append("price", String(parsedPrice ?? 0));
  payload.append("stock", String(form.stock));
  payload.append("type", form.type);
  payload.append("portion", form.portion.trim());
  payload.append("description", form.description?.trim() || "");
  payload.append("protein", form.protein?.trim() || "");
  payload.append("calories", form.calories?.trim() || "");
  payload.append("ingredients", form.ingredients?.trim() || "");
  payload.append("spiceLevel", form.spiceLevel || "Mild");
  payload.append("portionSize", form.portionSize?.trim() || "");
  payload.append("bestBefore", form.bestBefore?.trim() || "");
  payload.append("preparationTime", form.preparationTime?.trim() || "");
  payload.append("dietType", form.dietType || "Vegetarian");
  payload.append("servingType", form.servingType || "Hot meal");

  if (imageFile) {
    payload.append("image", imageFile);
  } else if (form.image?.trim()) {
    payload.append("image", form.image.trim());
  }

  return payload;
}

export default function AdminPanel({
  items,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  isSaving,
  initialCategory = "Breakfast",
  categoryLocked = false,
  categoryOptions = ["Breakfast", "Lunch", "Dinner", "Vegetarian", "Budget Meals"],
}) {
  const nextFoodId = useMemo(() => getNextFoodId(items), [items]);
  const [form, setForm] = useState(() => getDefaultForm(initialCategory, nextFoodId));
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const title = useMemo(() => (editingId ? "Update Food Item" : "Add New Food Item"), [editingId]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: initialCategory,
      foodID: editingId ? prev.foodID : nextFoodId,
    }));
  }, [initialCategory, nextFoodId, editingId]);

  const resetForm = () => {
    setForm(getDefaultForm(initialCategory, nextFoodId));
    setEditingId(null);
    setImageFile(null);
    setValidationErrors([]);
    setShowAdvanced(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(form, items, editingId, imageFile);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    const payload = buildPayload(form, imageFile);

    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onCreate(payload);
    }

    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      foodID: normalizeFoodIdValue(item.foodID || item.FoodID || ""),
      name: item.name || "",
      category: item.category || initialCategory,
      price: item.price ? formatRsPrice(item.price) : "",
      stock: item.stock || "",
      type: item.type || "Regular",
      portion: item.portion || "Regular",
      image: item.image || "",
      description: item.description || "",
      protein: item.protein || "",
      calories: item.calories || "",
      ingredients: item.ingredients || "",
      spiceLevel: item.spiceLevel || "Mild",
      portionSize: item.portionSize || "",
      bestBefore: item.bestBefore || "",
      preparationTime: item.preparationTime || "",
      dietType: item.dietType || "Vegetarian",
      servingType: item.servingType || "Hot meal",
    });
    setImageFile(null);
    setValidationErrors([]);
    setShowAdvanced(true);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-lg shadow-green-900/5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-800"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-green-100 px-3 py-2 text-sm font-medium text-green-800"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-700">Validation Errors:</p>
            <ul className="mt-1 space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx} className="text-xs text-red-600">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Basic Info */}
          <div>
            <h3 className="mb-3 font-semibold text-slate-800">Basic Information</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                value={form.foodID}
                readOnly
                placeholder="Food ID"
                className="rounded-xl border border-green-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
              />
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Food Name"
                className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />
              <p className="-mt-1 text-xs text-slate-500 md:col-span-2">
                
              </p>

              {categoryLocked ? (
                <input
                  value={form.category}
                  disabled
                  className="rounded-xl border border-green-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
                />
              ) : (
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                >
                  {categoryOptions.map((categoryName) => (
                    <option key={categoryName}>{categoryName}</option>
                  ))}
                </select>
              )}

              <input
                required
                type="text"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                onBlur={(event) => {
                  const parsedPrice = parseRsPrice(event.target.value);
                  if (parsedPrice !== null) {
                    setForm((prev) => ({ ...prev, price: formatRsPrice(parsedPrice) }));
                  }
                }}
                placeholder="Rs100.00"
                className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />

              <input
                required
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                placeholder="Stock"
                className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />

              <input
                required
                value={form.portion}
                onChange={(event) => setForm((prev) => ({ ...prev, portion: event.target.value }))}
                placeholder="Portion Size"
                className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />

              <input
                required
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                placeholder="Type"
                className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <h3 className="mb-3 font-semibold text-slate-800">Image</h3>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                required={!editingId && !form.image}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImageFile(file);
                }}
                className="w-full rounded-xl border border-green-200 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-green-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-green-800"
              />
              <p className="text-xs text-slate-500">
                {imageFile
                  ? `Selected: ${imageFile.name}`
                  : form.image
                    ? "No new image selected. Existing image will be kept."
                    : "Choose an image from your computer (required)."}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-3 font-semibold text-slate-800">Description</h3>
            <textarea
              required
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Detailed description of the food item"
              rows="3"
              className="w-full rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
            />
          </div>

          {/* Nutrition & Details */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              {showAdvanced ? "Hide" : "Show"} Nutritional & Prep Details
            </button>

            {showAdvanced && (
              <div className="space-y-3 rounded-xxl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    required
                    value={form.protein}
                    onChange={(event) => setForm((prev) => ({ ...prev, protein: event.target.value }))}
                    placeholder="Protein (e.g. High protein)"
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />
                  <input
                    required
                    value={form.calories}
                    onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))}
                    placeholder="Calories (e.g. 450-550 kcal)"
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />

                  <textarea
                    required
                    value={form.ingredients}
                    onChange={(event) => setForm((prev) => ({ ...prev, ingredients: event.target.value }))}
                    placeholder="Ingredients list"
                    rows="2"
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500 md:col-span-2"
                  />

                  <select
                    required
                    value={form.spiceLevel}
                    onChange={(event) => setForm((prev) => ({ ...prev, spiceLevel: event.target.value }))}
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  >
                    <option>Mild</option>
                    <option>Medium</option>
                    <option>Hot</option>
                    <option>Very Hot</option>
                  </select>

                  <input
                    required
                    value={form.portionSize}
                    onChange={(event) => setForm((prev) => ({ ...prev, portionSize: event.target.value }))}
                    placeholder="Portion Size (e.g. Full/Medium)"
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />

                  <input
                    required
                    value={form.bestBefore}
                    onChange={(event) => setForm((prev) => ({ ...prev, bestBefore: event.target.value }))}
                    placeholder="Best Before (e.g. 4-6 hours)"
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />

                  <input
                    required
                    value={form.preparationTime}
                    onChange={(event) => setForm((prev) => ({ ...prev, preparationTime: event.target.value }))}
                    placeholder="Preparation Time (e.g. 20-30 minutes)"
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />

                  <select
                    required
                    value={form.dietType}
                    onChange={(event) => setForm((prev) => ({ ...prev, dietType: event.target.value }))}
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  >
                    <option>Vegetarian</option>
                    <option>Non-Vegetarian</option>
                    <option>Vegan</option>
                  </select>

                  <select
                    required
                    value={form.servingType}
                    onChange={(event) => setForm((prev) => ({ ...prev, servingType: event.target.value }))}
                    className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  >
                    <option>Hot meal</option>
                    <option>Cold meal</option>
                    <option>Beverage</option>
                    <option>Snack</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            disabled={isSaving}
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
          >
            <Plus size={16} />
            {editingId ? "Save Changes" : "Add Food Item"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-lg shadow-green-900/5">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Manage Existing Items</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl border border-green-100 bg-green-50/30 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {item.category} | {item.portion} | LKR {Number(item.price || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">Stock: {item.stock}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item._id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

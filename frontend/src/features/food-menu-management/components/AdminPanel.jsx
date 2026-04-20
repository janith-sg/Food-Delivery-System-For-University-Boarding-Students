import React, { useEffect, useMemo, useState } from "react";
import { 
  Download, Pencil, Plus, RefreshCw, Trash2, X, 
  ChevronDown, ChevronUp, Info, Package, DollarSign, 
  Tag, Layers, Image, FileText, Activity, Clock, 
  Zap, Shield, Sparkles, Crown, TrendingUp, BarChart3,
  AlertCircle, CheckCircle, Search, Filter, Grid3x3,
  List, Star, Flame, Leaf, Coffee, Pizza, Sandwich,
  Cake, Apple, Salad, Soup, Droplet, Milk, Utensils,
  Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const categoryIcons = {
  Breakfast: <Sun className="w-4 h-4" />,
  Lunch: <Utensils className="w-4 h-4" />,
  Dinner: <Moon className="w-4 h-4" />,
  Vegetarian: <Leaf className="w-4 h-4" />,
  "Budget Meals": <DollarSign className="w-4 h-4" />,
};

const dietTypeColors = {
  Vegetarian: "from-green-500 to-emerald-500",
  "Non-Vegetarian": "from-red-500 to-rose-500",
  Vegan: "from-teal-500 to-green-500",
};

const spiceLevelColors = {
  Mild: "from-green-400 to-green-500",
  Medium: "from-yellow-400 to-orange-500",
  Hot: "from-orange-500 to-red-500",
  "Very Hot": "from-red-600 to-red-700",
};

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

function FormField({ icon, label, required, children, error }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function StatsCard({ icon, title, value, hint, accentClass = "border-emerald-500", iconWrapClass = "bg-emerald-50 text-emerald-600" }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${accentClass} border-l-[3px]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
        </div>
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${iconWrapClass}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function SidebarNavButton({ label, active, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-800"
          : "flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      }
    >
      <span className={active ? "text-emerald-600" : "text-slate-400"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SemiGauge({ title, percent, tone = "emerald" }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = 62;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  const toneConfig = {
    emerald: { stroke: "#22c55e", dot: "bg-emerald-500" },
    blue: { stroke: "#2563eb", dot: "bg-blue-600" },
    orange: { stroke: "#f97316", dot: "bg-orange-500" },
  };

  const palette = toneConfig[tone] || toneConfig.emerald;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-[28px] font-semibold text-slate-800">{title}</h3>
      <div className="mt-5 flex flex-col items-center">
        <svg viewBox="0 0 160 90" className="h-40 w-full max-w-[260px]">
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke={palette.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <p className="-mt-7 text-5xl font-bold text-slate-900">{clamped}%</p>
        <p className="mt-2 flex items-center gap-2 text-base text-slate-600">
          <span className={`h-2.5 w-2.5 rounded-full ${palette.dot}`} />
          Active
        </p>
      </div>
    </section>
  );
}

export default function AdminPanel({
  items,
  allItems,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  onGeneratePdf,
  isSaving,
  initialCategory = "Breakfast",
  categoryLocked = false,
  categoryOptions = ["Breakfast", "Lunch", "Dinner", "Vegetarian", "Budget Meals"],
}) {
  const idSourceItems = useMemo(() => (Array.isArray(allItems) && allItems.length ? allItems : items), [allItems, items]);
  const nextFoodId = useMemo(() => getNextFoodId(idSourceItems), [idSourceItems]);
  const [form, setForm] = useState(() => getDefaultForm(initialCategory, nextFoodId));
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const title = useMemo(() => (editingId ? "Update Food Item" : "Add New Food Item"), [editingId]);

  // Stats calculations
  const stats = useMemo(() => ({
    totalItems: items.length,
    lowStock: items.filter(item => {
      const stock = Number(item.stock);
      return !isNaN(stock) && stock > 0 && stock <= 5;
    }).length,
    outOfStock: items.filter(item => {
      const stock = Number(item.stock);
      return !isNaN(stock) && stock <= 0;
    }).length,
    popularItems: items.filter(item => item.isPopular).length,
    avgPrice: (items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) / items.length || 0).toFixed(2),
  }), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      category: initialCategory,
      foodID: editingId ? prev.foodID : nextFoodId,
    }));
  }, [initialCategory, nextFoodId, editingId]);

  const resetForm = (categoryName = initialCategory) => {
    setForm(getDefaultForm(categoryName, nextFoodId));
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setValidationErrors([]);
    setShowAdvanced(false);
  };

  const openAddFormForCategory = (categoryName) => {
    resetForm(categoryName || initialCategory);
    setSelectedCategory(categoryName || "all");
    setActiveSection("add");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(form, idSourceItems, editingId, imageFile);

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
    setImagePreview(null);
    setValidationErrors([]);
    setShowAdvanced(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set([
      ...items.map((item) => item.category).filter(Boolean),
      ...categoryOptions,
    ]);
    return ["all", ...Array.from(cats)];
  }, [items, categoryOptions]);

  const featuredCounts = useMemo(() => {
    return categoryOptions.reduce((acc, categoryName) => {
      acc[categoryName] = idSourceItems.filter((item) => String(item.category || "").trim() === categoryName).length;
      return acc;
    }, {});
  }, [categoryOptions, idSourceItems]);

  const availableCount = items.filter((item) => Number(item.stock) > 0).length;
  const lowStockPercent = items.length ? Math.round((stats.lowStock / items.length) * 100) : 0;
  const availablePercent = items.length ? Math.round((availableCount / items.length) * 100) : 0;
  const featuredPercent = idSourceItems.length
    ? Math.round((Object.values(featuredCounts).filter((count) => Number(count) > 0).length / Math.max(categoryOptions.length, 1)) * 100)
    : 0;

  const menuSections = [
    { id: "overview", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "featured", label: "Featured Categories", icon: <Sparkles className="h-4 w-4" /> },
    { id: "add", label: editingId ? "Update Food Item" : "Add New Food Item", icon: <Plus className="h-4 w-4" /> },
    { id: "manage", label: "Manage Existing Items", icon: <List className="h-4 w-4" /> },
  ];

  const renderFoodForm = () => (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingId ? "Update an existing food menu item" : "Add a new item to the food menu"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={onGeneratePdf}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              <Download size={16} />
              PDF Report
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {validationErrors.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-6 rounded-2xl border border-rose-200 bg-rose-50 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <p className="font-semibold text-rose-700">Validation Errors</p>
          </div>
          <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {validationErrors.map((error, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                {error}
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6 p-6">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <FormField icon={<Image className="w-4 h-4" />} label="Food Image" required>
              <div className="mt-1">
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingId && !form.image}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-emerald-300 p-3 transition-colors hover:border-emerald-500">
                    <div className="rounded-lg bg-emerald-100 p-2">
                      <Image className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-600">
                      {imageFile ? imageFile.name : form.image ? "Click to change image" : "Click to upload image"}
                    </span>
                  </div>
                </label>
              </div>
            </FormField>
          </div>
          {imagePreview ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-20 w-20 overflow-hidden rounded-xl shadow-lg"
            >
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            </motion.div>
          ) : null}
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Basic Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField icon={<Tag className="w-4 h-4" />} label="Food ID" required>
              <input
                required
                value={form.foodID}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-600 outline-none"
              />
            </FormField>
            <FormField icon={<Utensils className="w-4 h-4" />} label="Food Name" required>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Enter food name"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </FormField>

            {categoryLocked ? (
              <FormField icon={<Layers className="w-4 h-4" />} label="Category" required>
                <input
                  value={form.category}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-600 outline-none"
                />
              </FormField>
            ) : (
              <FormField icon={<Layers className="w-4 h-4" />} label="Category" required>
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {categoryOptions.map((categoryName) => (
                    <option key={categoryName}>{categoryName}</option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField icon={<DollarSign className="w-4 h-4" />} label="Price (LKR)" required>
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
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </FormField>

            <FormField icon={<Package className="w-4 h-4" />} label="Stock Quantity" required>
              <input
                required
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                placeholder="Enter stock quantity"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </FormField>

            <FormField icon={<Layers className="w-4 h-4" />} label="Portion Size" required>
              <input
                required
                value={form.portion}
                onChange={(event) => setForm((prev) => ({ ...prev, portion: event.target.value }))}
                placeholder="e.g., Regular, Large, Small"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </FormField>

            <FormField icon={<Tag className="w-4 h-4" />} label="Food Type" required>
              <input
                required
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                placeholder="e.g., Main Course, Appetizer"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </FormField>
          </div>
        </div>

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <FileText className="w-5 h-5 text-emerald-600" />
            Description
          </h3>
          <textarea
            required
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Detailed description of the food item..."
            rows="4"
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-4 transition-all hover:bg-slate-100"
        >
          <span className="flex items-center gap-2 font-semibold text-slate-700">
            <Activity className="w-5 h-5 text-emerald-600" />
            Nutritional and Preparation Details
          </span>
          {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </motion.button>

        <AnimatePresence>
          {showAdvanced ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField icon={<Activity className="w-4 h-4" />} label="Protein Content" required>
                  <input
                    required
                    value={form.protein}
                    onChange={(event) => setForm((prev) => ({ ...prev, protein: event.target.value }))}
                    placeholder="e.g., High protein, 20g"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </FormField>

                <FormField icon={<Flame className="w-4 h-4" />} label="Calories" required>
                  <input
                    required
                    value={form.calories}
                    onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))}
                    placeholder="e.g., 450-550 kcal"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField icon={<Info className="w-4 h-4" />} label="Ingredients" required>
                    <textarea
                      required
                      value={form.ingredients}
                      onChange={(event) => setForm((prev) => ({ ...prev, ingredients: event.target.value }))}
                      placeholder="List all ingredients separated by commas"
                      rows="3"
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </FormField>
                </div>

                <FormField icon={<Flame className="w-4 h-4" />} label="Spice Level" required>
                  <select
                    required
                    value={form.spiceLevel}
                    onChange={(event) => setForm((prev) => ({ ...prev, spiceLevel: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option>Mild</option>
                    <option>Medium</option>
                    <option>Hot</option>
                    <option>Very Hot</option>
                  </select>
                </FormField>

                <FormField icon={<Layers className="w-4 h-4" />} label="Portion Size Detail" required>
                  <input
                    required
                    value={form.portionSize}
                    onChange={(event) => setForm((prev) => ({ ...prev, portionSize: event.target.value }))}
                    placeholder="e.g., Full/Medium"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </FormField>

                <FormField icon={<Clock className="w-4 h-4" />} label="Best Before" required>
                  <input
                    required
                    value={form.bestBefore}
                    onChange={(event) => setForm((prev) => ({ ...prev, bestBefore: event.target.value }))}
                    placeholder="e.g., 4-6 hours"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </FormField>

                <FormField icon={<Clock className="w-4 h-4" />} label="Preparation Time" required>
                  <input
                    required
                    value={form.preparationTime}
                    onChange={(event) => setForm((prev) => ({ ...prev, preparationTime: event.target.value }))}
                    placeholder="e.g., 20-30 minutes"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </FormField>

                <FormField icon={<Leaf className="w-4 h-4" />} label="Diet Type" required>
                  <select
                    required
                    value={form.dietType}
                    onChange={(event) => setForm((prev) => ({ ...prev, dietType: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option>Vegetarian</option>
                    <option>Non-Vegetarian</option>
                    <option>Vegan</option>
                  </select>
                </FormField>

                <FormField icon={<Utensils className="w-4 h-4" />} label="Serving Type" required>
                  <select
                    required
                    value={form.servingType}
                    onChange={(event) => setForm((prev) => ({ ...prev, servingType: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option>Hot meal</option>
                    <option>Cold meal</option>
                    <option>Beverage</option>
                    <option>Snack</option>
                  </select>
                </FormField>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={isSaving}
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editingId ? (
            <span className="flex items-center justify-center gap-2">
              <Pencil size={18} />
              Save Changes
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Plus size={18} />
              Add Food Item
            </span>
          )}
        </motion.button>
      </form>
    </div>
  );

  const renderManageItems = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold text-slate-900">Manage Existing Items</h3>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name or category"
          className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {uniqueCategories.map((categoryName) => (
          <button
            key={categoryName}
            type="button"
            onClick={() => setSelectedCategory(categoryName)}
            className={
              selectedCategory === categoryName
                ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            }
          >
            {categoryName === "all" ? "All" : categoryName}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 md:flex-row md:items-center md:justify-between"
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
                onClick={() => {
                  startEdit(item);
                  setActiveSection("add");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700"
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
        {filteredItems.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            No food items found for this filter.
          </p>
        ) : null}
      </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openAddFormForCategory(selectedCategory === "all" ? initialCategory : selectedCategory)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Add Item to Selected Category
          </button>
          <button
            type="button"
            onClick={() => openAddFormForCategory(initialCategory)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Reset to Default Category
          </button>
        </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[70vh] rounded-3xl border border-slate-200 bg-[#f8fafc] p-3 shadow-sm md:p-4">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <h2 className="px-2 py-3 text-2xl font-bold text-slate-900">Food Dashboard</h2>
          <nav className="space-y-1.5" aria-label="Food admin navigation">
            {menuSections.map((section) => (
              <SidebarNavButton
                key={section.id}
                label={section.label}
                icon={section.icon}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </nav>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900">Overview</h1>
              <p className="mt-2 text-sm text-slate-500">Food Menu Management control panel</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={onGeneratePdf}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                <Download className="h-4 w-4" />
                Report
              </button>
            </div>
          </header>

          {activeSection === "overview" ? (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
                <StatsCard
                  icon={<Package className="h-5 w-5" />}
                  title="Total Menu Items"
                  value={stats.totalItems}
                  hint="Across all categories"
                  accentClass="border-blue-500"
                  iconWrapClass="bg-blue-50 text-blue-600"
                />
                <StatsCard
                  icon={<CheckCircle className="h-5 w-5" />}
                  title="Available Items"
                  value={availableCount}
                  hint="Ready for orders"
                  accentClass="border-emerald-500"
                  iconWrapClass="bg-emerald-50 text-emerald-600"
                />
                <StatsCard
                  icon={<AlertCircle className="h-5 w-5" />}
                  title="Low Stock"
                  value={stats.lowStock}
                  hint="Needs restocking"
                  accentClass="border-violet-500"
                  iconWrapClass="bg-violet-50 text-violet-600"
                />
                <StatsCard
                  icon={<DollarSign className="h-5 w-5" />}
                  title="Average Price"
                  value={`LKR ${stats.avgPrice}`}
                  hint="Menu price average"
                  accentClass="border-orange-500"
                  iconWrapClass="bg-orange-50 text-orange-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <SemiGauge title="Menu Availability Status" percent={availablePercent} tone="emerald" />
                <SemiGauge title="Low Stock Status" percent={lowStockPercent} tone="blue" />
              </div>
            </>
          ) : null}

          {activeSection === "featured" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {categoryOptions.map((categoryName, index) => {
                  const count = featuredCounts[categoryName] || 0;
                  const palette = [
                    "border-emerald-500 text-emerald-700 bg-emerald-50",
                    "border-blue-500 text-blue-700 bg-blue-50",
                    "border-violet-500 text-violet-700 bg-violet-50",
                    "border-orange-500 text-orange-700 bg-orange-50",
                  ][index % 4];

                  return (
                    <motion.button
                      key={categoryName}
                      type="button"
                      whileHover={{ y: -3 }}
                      onClick={() => openAddFormForCategory(categoryName)}
                      className={`rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition ${palette}`}
                    >
                      <p className="text-sm font-semibold text-slate-500">Featured Category</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{count}</p>
                      <p className="mt-1 text-sm text-slate-600">{categoryName}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openAddFormForCategory(categoryName);
                          }}
                          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Add Food
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedCategory(categoryName);
                            setActiveSection("manage");
                          }}
                          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          View Items
                        </button>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <SemiGauge title="Featured Category Coverage" percent={featuredPercent} tone="orange" />
            </div>
          ) : null}

          {activeSection === "add" ? renderFoodForm() : null}
          {activeSection === "manage" ? renderManageItems() : null}
        </section>
      </div>
    </motion.div>
  );
}

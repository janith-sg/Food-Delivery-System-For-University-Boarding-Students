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

function StatsCard({ icon, title, value, color, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 shadow-lg`}
    >
      <div className="absolute top-0 right-0 opacity-10">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-white/80 text-xs uppercase tracking-wider">{title}</p>
        <p className="text-white text-2xl font-bold mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

export default function AdminPanel({
  items,
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
  const nextFoodId = useMemo(() => getNextFoodId(items), [items]);
  const [form, setForm] = useState(() => getDefaultForm(initialCategory, nextFoodId));
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
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

  const resetForm = () => {
    setForm(getDefaultForm(initialCategory, nextFoodId));
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
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
    const cats = new Set(items.map(item => item.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Dashboard */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
      >
        <StatsCard
          icon={<Package className="w-12 h-12" />}
          title="Total Items"
          value={stats.totalItems}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatsCard
          icon={<AlertCircle className="w-12 h-12" />}
          title="Low Stock"
          value={stats.lowStock}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatsCard
          icon={<X className="w-12 h-12" />}
          title="Out of Stock"
          value={stats.outOfStock}
          gradient="from-red-500 to-rose-500"
        />
        <StatsCard
          icon={<Flame className="w-12 h-12" />}
          title="Popular Items"
          value={stats.popularItems}
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          icon={<DollarSign className="w-12 h-12" />}
          title="Avg Price"
          value={`LKR ${stats.avgPrice}`}
          gradient="from-green-500 to-emerald-500"
        />
      </motion.div>

      {/* Form Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-20" />
        <div className="relative rounded-3xl bg-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl" />
          
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingId ? "Update existing menu item" : "Add a new delicious item to your menu"}
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-md"
                >
                  <RefreshCw size={18} />
                  Refresh
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGeneratePdf}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold shadow-md"
                >
                  <Download size={18} />
                  PDF Report
                </motion.button>
                {editingId && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                  >
                    Cancel Edit
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-700">Validation Errors:</p>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {error}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
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
                      <div className="flex items-center gap-3 p-3 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 transition-colors">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Image className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {imageFile ? imageFile.name : form.image ? "Click to change image" : "Click to upload image"}
                        </span>
                      </div>
                    </label>
                  </div>
                </FormField>
              </div>
              {imagePreview && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-xl overflow-hidden shadow-lg"
                >
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </motion.div>
              )}
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                Basic Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField icon={<Tag className="w-4 h-4" />} label="Food ID" required>
                  <input
                    required
                    value={form.foodID}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 outline-none cursor-not-allowed"
                  />
                </FormField>
                <FormField icon={<Utensils className="w-4 h-4" />} label="Food Name" required>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Enter food name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </FormField>

                {categoryLocked ? (
                  <FormField icon={<Layers className="w-4 h-4" />} label="Category" required>
                    <input
                      value={form.category}
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 outline-none cursor-not-allowed"
                    />
                  </FormField>
                ) : (
                  <FormField icon={<Layers className="w-4 h-4" />} label="Category" required>
                    <select
                      value={form.category}
                      onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </FormField>

                <FormField icon={<Package className="w-4 h-4" />} label="Stock Quantity" required>
                  <input
                    required
                    value={form.stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                    placeholder="Enter stock quantity"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </FormField>

                <FormField icon={<Layers className="w-4 h-4" />} label="Portion Size" required>
                  <input
                    required
                    value={form.portion}
                    onChange={(event) => setForm((prev) => ({ ...prev, portion: event.target.value }))}
                    placeholder="e.g., Regular, Large, Small"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </FormField>

                <FormField icon={<Tag className="w-4 h-4" />} label="Food Type" required>
                  <input
                    required
                    value={form.type}
                    onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                    placeholder="e.g., Main Course, Appetizer"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </FormField>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                Description
              </h3>
              <textarea
                required
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Detailed description of the food item..."
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
              />
            </div>

            {/* Advanced Details Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all"
            >
              <span className="flex items-center gap-2 font-semibold text-gray-700">
                <Activity className="w-5 h-5 text-green-500" />
                Nutritional & Preparation Details
              </span>
              {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </motion.button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField icon={<Activity className="w-4 h-4" />} label="Protein Content" required>
                      <input
                        required
                        value={form.protein}
                        onChange={(event) => setForm((prev) => ({ ...prev, protein: event.target.value }))}
                        placeholder="e.g., High protein, 20g"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    </FormField>

                    <FormField icon={<Flame className="w-4 h-4" />} label="Calories" required>
                      <input
                        required
                        value={form.calories}
                        onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))}
                        placeholder="e.g., 450-550 kcal"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
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
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                        />
                      </FormField>
                    </div>

                    <FormField icon={<Flame className="w-4 h-4" />} label="Spice Level" required>
                      <select
                        required
                        value={form.spiceLevel}
                        onChange={(event) => setForm((prev) => ({ ...prev, spiceLevel: event.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    </FormField>

                    <FormField icon={<Clock className="w-4 h-4" />} label="Best Before" required>
                      <input
                        required
                        value={form.bestBefore}
                        onChange={(event) => setForm((prev) => ({ ...prev, bestBefore: event.target.value }))}
                        placeholder="e.g., 4-6 hours"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    </FormField>

                    <FormField icon={<Clock className="w-4 h-4" />} label="Preparation Time" required>
                      <input
                        required
                        value={form.preparationTime}
                        onChange={(event) => setForm((prev) => ({ ...prev, preparationTime: event.target.value }))}
                        placeholder="e.g., 20-30 minutes"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    </FormField>

                    <FormField icon={<Leaf className="w-4 h-4" />} label="Diet Type" required>
                      <select
                        required
                        value={form.dietType}
                        onChange={(event) => setForm((prev) => ({ ...prev, dietType: event.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      >
                        <option>Hot meal</option>
                        <option>Cold meal</option>
                        <option>Beverage</option>
                        <option>Snack</option>
                      </select>
                    </FormField>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSaving}
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </motion.div>

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
    </motion.div>
  );
}
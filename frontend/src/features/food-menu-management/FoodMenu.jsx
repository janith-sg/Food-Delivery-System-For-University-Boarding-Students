import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  X,
  Coffee,
  Sun,
  Moon,
  Users,
  Award,
  Crown,
  Flame,
  Leaf,
  Pizza,
  Sandwich,
  Cake,
  IceCream,
  Apple,
  Salad,
  Soup,
  Droplet,
  Milk,
  Coffee as CoffeeIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminPanel from "./components/AdminPanel";
import FilterBar from "./components/FilterBar";
import FoodCard from "./components/FoodCard";
import FoodDetailsModal from "./components/FoodDetailsModal";
import {
  createFoodItem,
  deleteFoodItem,
  downloadFoodReportPdf,
  getFoodItems,
  rateFoodItem,
  updateFoodItem,
} from "./api";
import UserMenuBar from "../user-management/components/UserMenuBar";
import CustomerMenuBar from "../user-management/components/CustomerMenuBar";
import "./FoodMenu.css";
import { clearAuthWithAudit, getToken, getUser } from "../../lib/auth";
import { getProfilePath } from "../../lib/postLoginRedirect";

const BUDGET_LIMIT = 350;
const CART_STORAGE_KEY = "food_menu_cart";
const OFFERS_STORAGE_KEY = "food_menu_limited_time_offers";
const STUDENT_RATINGS_STORAGE_KEY = "food_menu_student_ratings";
const PURCHASED_ITEMS_KEY = "food_menu_purchased_items";
const SORT_OPTIONS = {
  PRICE_ASC: "PRICE_ASC",
  PRICE_DESC: "PRICE_DESC",
  HIGHEST_RATED: "HIGHEST_RATED",
};

const DEFAULT_OFFERS = [
  {
    id: "budget-meals-1",
    icon: "💰",
    title: "Student Budget Meals",
    subtitle: "Save More on Your Daily Meals",
    description: "Get up to 40% OFF on budget-friendly meals. Perfect for university students.",
    buttonLabel: "Order Now",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "budget-meals-2",
    icon: "🍱",
    title: "Daily Lunch Deals",
    subtitle: "Fresh Meals at Student Prices",
    description: "Affordable combos designed for boarding students.",
    buttonLabel: "View Meals",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "flash-deals",
    icon: "⚡",
    title: "Flash Food Deals",
    subtitle: "Hurry Up! Limited Offers",
    description: "Get exclusive discounts for a short time. Don't miss out!",
    buttonLabel: "Grab Deal",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "combo-offers",
    icon: "🍽️",
    title: "Combo Meal Offers",
    subtitle: "Best Value Meals",
    description: "Bundle your favorites and save more with combo pricing.",
    buttonLabel: "Explore Combos",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
  },
];

const EMPTY_OFFER_FORM = {
  icon: "",
  title: "",
  subtitle: "",
  description: "",
  buttonLabel: "",
  image: "",
};

const FEATURED_CATEGORIES = [
  {
    name: "Soft Drinks",
    slug: "soft-drinks",
    emoji: "🥤",
  },
  {
    name: "Coffee",
    slug: "coffee",
    emoji: "☕",
  },
  {
    name: "Milk & Dairy",
    slug: "milk-dairy",
    emoji: "🥛",
  },
  {
    name: "Water & Juice",
    slug: "water-juice",
    emoji: "💧",
  },
  {
    name: "Snacks",
    slug: "snacks",
    emoji: "🍿",
  },
  {
    name: "Sandwiches",
    slug: "sandwiches",
    emoji: "🥪",
  },
  {
    name: "Burgers",
    slug: "burgers",
    emoji: "🍔",
  },
  {
    name: "Short Eats",
    slug: "short-eats",
    emoji: "🍢",
  },
  {
    name: "Pizza",
    slug: "pizza",
    emoji: "🍕",
  },
  {
    name: "Cakes",
    slug: "cakes",
    emoji: "🍰",
  },
  {
    name: "Ice Cream",
    slug: "ice-cream",
    emoji: "🍦",
  },
  {
    name: "Fresh Fruits",
    slug: "fresh-fruits",
    emoji: "🍎",
  },
  {
    name: "Healthy",
    slug: "healthy",
    emoji: "🥗",
  },
  {
    name: "Soups",
    slug: "soups",
    emoji: "🥣",
  },
];

function getCurrentMealLabel() {
  const hour = new Date().getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 17) return "Lunch";
  return "Dinner";
}

function normalizeItem(item) {
  const normalizedFoodId = item.foodID || item._id || item.id || item.name;
  const normalizedCategory = String(item.category || "").trim() || "Lunch";
  const price = Number(item.price || 0);
  const stockText = String(item.stock || "").trim();
  const numericStock = Number(stockText);
  const isOutOfStock =
    (!Number.isNaN(numericStock) && numericStock <= 0) ||
    /out|unavailable|sold|false/i.test(stockText);
  const lowStock = !isOutOfStock && !Number.isNaN(numericStock) && numericStock > 0 && numericStock <= 5;

  return {
    ...item,
    foodID: normalizedFoodId,
    category: normalizedCategory,
    price,
    ratingAverage: Number(item.ratingAverage || 0),
    ratingCount: Number(item.ratingCount || 0),
    isOutOfStock,
    lowStock,
    isPopular:
      Boolean(item.popular) ||
      Number(item.ordersCount || 0) >= 20 ||
      Number(item.ratingCount || 0) >= 10,
    isBudgetFriendly: /budget/i.test(normalizedCategory) || price <= BUDGET_LIMIT,
  };
}

function applyPurchasedStockReduction(items) {
  try {
    const purchasedItemsJson = localStorage.getItem(PURCHASED_ITEMS_KEY);
    if (!purchasedItemsJson) return items;
    
    const purchasedItems = JSON.parse(purchasedItemsJson);
    if (!Array.isArray(purchasedItems)) return items;
    
    const updatedItems = items.map((item) => {
      const purchased = purchasedItems.find((p) => p._id === (item._id || item.foodID));
      if (!purchased) return item;
      
      const stockText = String(item.stock || "").trim();
      const numericStock = Number(stockText);
      if (Number.isNaN(numericStock)) return item;
      
      const newStock = Math.max(0, numericStock - Number(purchased.quantity || 1));
      return { ...item, stock: newStock };
    });
    
    localStorage.removeItem(PURCHASED_ITEMS_KEY);
    return updatedItems;
  } catch (error) {
    console.error("Error applying purchased stock reduction:", error);
    return items;
  }
}

function matchesCategory(item, selectedCategory) {
  if (selectedCategory === "All") return true;
  if (selectedCategory === "Vegetarian") {
    return /veg/i.test(item.category || "") || /veg/i.test(item.type || "");
  }
  if (selectedCategory === "Budget Meals") {
    return /budget/i.test(item.category || "") || item.isBudgetFriendly;
  }
  return item.category === selectedCategory;
}

function getNextStockValue(stock) {
  const stockText = String(stock || "").trim();
  const numericStock = Number(stockText);

  if (!Number.isNaN(numericStock)) {
    return numericStock <= 0 ? "10" : "0";
  }

  if (/out|unavailable|false|sold/i.test(stockText)) {
    return "in-stock";
  }

  return "out-of-stock";
}

function getFeaturedCategoryBySlug(slug) {
  if (!slug) return null;
  return FEATURED_CATEGORIES.find((category) => category.slug === slug) || null;
}

function matchesFeaturedCategory(item, categoryName) {
  return String(item.category || "").trim().toLowerCase() === String(categoryName || "").trim().toLowerCase();
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl"
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 rounded-full bg-gray-200" />
            <div className="h-3 w-1/3 rounded-full bg-gray-200" />
            <div className="h-3 w-full rounded-full bg-gray-200" />
            <div className="mt-4 h-10 w-full rounded-full bg-gray-200" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-green-400"
          initial={{ opacity: 0, x: (i * 67) % 1200, y: (i * 41) % 800 }}
          animate={{ y: [null, -100, -200], opacity: [0, 0.4, 0] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

function HeroSlider() {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
      title: "Combo Meal Offers",
      subtitle: "Hot breakfast, lunch, and dinner ready for campus",
    },
    {
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80",
      title: "Healthy Choices",
      subtitle: "Balanced food options for every student",
    },
    {
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80",
      title: "Quick Snacks and Drinks",
      subtitle: "Order fast and enjoy between lectures",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => window.clearInterval(timerId);
  }, [slides.length]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-8 overflow-hidden rounded-3xl shadow-2xl"
    >
      <div className="relative h-64 w-full sm:h-80 lg:h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img src={slides[activeIndex].image} alt={slides[activeIndex].title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold sm:text-4xl">
                {slides[activeIndex].title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-sm text-white/90 sm:text-base"
              >
                {slides[activeIndex].subtitle}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-white/40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-white/40"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-6 bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function FeaturedCategories({ isAdmin, categoryCounts = {}, adminBasePath = '/admin/menu' }) {
  return (
    <section className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-extrabold text-slate-900">Featured Categories</h2>
          <p className="mt-1 text-lg text-slate-500">Explore our delicious categories</p>
        </div>
        <Link
          to={isAdmin ? `${adminBasePath}` : "/menu"}
          className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 text-sm font-bold text-white no-underline shadow-md transition hover:brightness-95"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {FEATURED_CATEGORIES.map((category) => {
          const path = isAdmin
            ? `${adminBasePath}/category/${category.slug}`
            : `/menu/category/${category.slug}`;

          return (
            <Link key={category.slug} to={path} className="group block no-underline">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-4 text-slate-900 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-emerald-100/60" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <span className="mb-2 text-3xl leading-none">{category.emoji}</span>
                  <span className="text-xs font-extrabold leading-tight">{category.name}</span>
                  <p className="mt-1.5 text-[10px] font-semibold text-emerald-700">
                    {Number(categoryCounts[category.name] || 0)} items
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PromoBanner({
  notices,
  isAdmin,
  onAddOffer,
  onEditOffer,
  onDeleteOffer,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            🔥 Limited Time Offers
          </h2>
          <p className="text-gray-500 mt-1">Grab these deals before they're gone!</p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddOffer}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold shadow-lg"
          >
            + Add Offer
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {notices.map((notice, index) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-48 overflow-hidden">
              <img
                src={notice.image}
                alt={notice.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                  Limited Time
                </span>
              </div>
              <div className="absolute top-3 right-3 text-2xl">
                {notice.icon}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{notice.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{notice.subtitle}</p>
              <p className="text-sm text-gray-500 mb-4">{notice.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold shadow-md"
              >
                {notice.buttonLabel}
              </motion.button>

              {isAdmin && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onEditOffer(notice)}
                    className="flex-1 py-1.5 bg-blue-500 text-white rounded-full text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteOffer(notice.id)}
                    className="flex-1 py-1.5 bg-red-500 text-white rounded-full text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function FeatureCards() {
  const features = [
    {
      title: "Everyday Fresh & Clean",
      description: "Premium quality ingredients",
      bgColor: "from-orange-400 to-red-500",
      image: "🥗",
      icon: <Leaf className="w-8 h-8" />,
    },
    {
      title: "Healthy Breakfast",
      description: "Start your day right",
      bgColor: "from-blue-400 to-cyan-500",
      image: "🍳",
      icon: <Sun className="w-8 h-8" />,
    },
    {
      title: "Affordable Meals",
      description: "Student budget friendly",
      bgColor: "from-green-400 to-emerald-500",
      image: "💰",
      icon: <Heart className="w-8 h-8" />,
    },
  ];

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.bgColor} p-6 text-white shadow-xl cursor-pointer`}
        >
          <div className="absolute -right-8 -top-8 opacity-20">
            {feature.icon}
          </div>
          <div className="relative z-10">
            <div className="mb-3 text-5xl">{feature.image}</div>
            <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
            <p className="mb-4 text-white/80 text-sm">{feature.description}</p>
            <button className="text-sm font-semibold text-white hover:underline">
              Shop now →
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PopularProducts({ items, onAddToCart }) {
  const popularItems = useMemo(() => {
    return items
      .filter((item) => item.isPopular && !item.isOutOfStock)
      .slice(0, 8);
  }, [items]);

  if (popularItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-16"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🔥 Popular Products
          </h2>
          <p className="text-gray-500 mt-1">Most loved by our customers</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trending now</span>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {popularItems.map((item, idx) => (
          <motion.div
            key={item._id || idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -8 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500" />
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-7xl transition-transform duration-500 group-hover:scale-110">
                  🍽️
                </div>
                {item.lowStock && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                      Low Stock
                    </span>
                  </div>
                )}
                {item.isPopular && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                      🔥 Popular
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">
                    LKR {Number(item.price || 0).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {item.ratingAverage.toFixed(1)}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={item.isOutOfStock}
                  onClick={() => onAddToCart(item)}
                  className={`w-full py-2.5 rounded-full font-semibold transition-all ${
                    item.isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {item.isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function enforceCategory(payload, categoryName) {
  if (!categoryName) return payload;

  if (payload instanceof FormData) {
    payload.set("category", categoryName);
    return payload;
  }

  return {
    ...payload,
    category: categoryName,
  };
}

function OfferForm({ form, errors, isEditing, onChange, onSubmit, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-4">
          {isEditing ? "Edit Offer" : "Add New Offer"}
        </h3>
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            {errors.map((error, i) => (
              <p key={i} className="text-red-600 text-sm">{error}</p>
            ))}
          </div>
        )}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Icon (emoji)"
            value={form.icon}
            onChange={(e) => onChange("icon", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={form.subtitle}
            onChange={(e) => onChange("subtitle", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Button Label"
            value={form.buttonLabel}
            onChange={(e) => onChange("buttonLabel", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="url"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => onChange("image", e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            onClick={onSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold"
          >
            {isEditing ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FoodMenu({ isAdmin = false, adminBasePath = '/admin/menu' }) {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const showUserMenuBar =
    isAdmin || (Boolean(getToken()) && getUser()?.accountType === 'customer');
  const isLoggedInCustomer =
    Boolean(getToken()) && getUser()?.accountType === 'customer';
  const selectedFeaturedCategory = useMemo(
    () => getFeaturedCategoryBySlug(categorySlug),
    [categorySlug],
  );

  const isCategoryPage = Boolean(selectedFeaturedCategory);

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.HIGHEST_RATED);
  const [budgetOnly, setBudgetOnly] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [scheduleOnly, setScheduleOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [offers, setOffers] = useState(DEFAULT_OFFERS);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER_FORM);
  const [offerErrors, setOfferErrors] = useState([]);
  const [studentRatings, setStudentRatings] = useState({});

  const currentMealLabel = useMemo(() => getCurrentMealLabel(), []);

  const availableCategories = useMemo(
    () => Array.from(new Set([
      "Breakfast",
      "Lunch",
      "Dinner",
      "Vegetarian",
      "Budget Meals",
      ...FEATURED_CATEGORIES.map((category) => category.name),
    ])),
    [],
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getFoodItems();
      const normalized = Array.isArray(data) ? data.map(normalizeItem) : [];
      const withReducedStock = applyPurchasedStockReduction(normalized);
      setItems(withReducedStock);
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Could not load food items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /** Scroll to All Products when visiting /menu#all-products (or legacy #our-menu). */
  useEffect(() => {
    if (!location.pathname.startsWith('/menu')) return;
    const raw = (location.hash || '').replace(/^#/, '');
    if (raw !== 'all-products' && raw !== 'our-menu') return;

    const run = () => {
      const el = document.getElementById('all-products');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!loading) {
      const id = window.setTimeout(run, 80);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [location.pathname, location.hash, loading]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setCart(parsed);
      }
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    try {
      const storedOffers = localStorage.getItem(OFFERS_STORAGE_KEY);
      if (!storedOffers) return;
      const parsedOffers = JSON.parse(storedOffers);
      if (Array.isArray(parsedOffers) && parsedOffers.length > 0) {
        setOffers(parsedOffers);
      }
    } catch {
      setOffers(DEFAULT_OFFERS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    try {
      const storedRatings = localStorage.getItem(STUDENT_RATINGS_STORAGE_KEY);
      if (!storedRatings) return;
      const parsedRatings = JSON.parse(storedRatings);
      if (parsedRatings && typeof parsedRatings === "object") {
        setStudentRatings(parsedRatings);
      }
    } catch {
      setStudentRatings({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STUDENT_RATINGS_STORAGE_KEY, JSON.stringify(studentRatings));
  }, [studentRatings]);

  const featuredItems = useMemo(() => {
    if (!selectedFeaturedCategory) return items;
    return items.filter((item) => matchesFeaturedCategory(item, selectedFeaturedCategory.name));
  }, [items, selectedFeaturedCategory]);

  const filteredItems = useMemo(() => {
    const sourceItems = isCategoryPage ? featuredItems : items;

    const matched = sourceItems.filter((item) => {
      const searchMatch = item.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
      const categoryMatch = isCategoryPage ? true : matchesCategory(item, selectedCategory);
      const budgetMatch = !budgetOnly || item.isBudgetFriendly;
      const stockMatch = !hideOutOfStock || !item.isOutOfStock;
      const scheduleMatch = !scheduleOnly || item.category === currentMealLabel;

      return searchMatch && categoryMatch && budgetMatch && stockMatch && scheduleMatch;
    });

    const sorted = [...matched].sort((a, b) => {
      if (sortBy === SORT_OPTIONS.PRICE_ASC) return a.price - b.price;
      if (sortBy === SORT_OPTIONS.PRICE_DESC) return b.price - a.price;

      if (b.ratingAverage !== a.ratingAverage) {
        return b.ratingAverage - a.ratingAverage;
      }
      if (b.ratingCount !== a.ratingCount) {
        return b.ratingCount - a.ratingCount;
      }
      return a.price - b.price;
    });

    return sorted;
  }, [items, featuredItems, isCategoryPage, searchTerm, selectedCategory, budgetOnly, hideOutOfStock, scheduleOnly, currentMealLabel, sortBy]);

  const featuredCategoryCounts = useMemo(() => {
    return FEATURED_CATEGORIES.reduce((acc, category) => {
      acc[category.name] = items.filter((item) => matchesFeaturedCategory(item, category.name)).length;
      return acc;
    }, {});
  }, [items]);

  const saveAction = async (action) => {
    setIsSaving(true);
    setError("");
    try {
      await action();
      await fetchItems();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Action failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = (payload) => {
    const nextPayload = enforceCategory(payload, selectedFeaturedCategory?.name);
    return saveAction(() => createFoodItem(nextPayload));
  };

  const handleUpdate = (id, payload) => {
    const nextPayload = enforceCategory(payload, selectedFeaturedCategory?.name);
    return saveAction(() => updateFoodItem(id, nextPayload));
  };

  const handleDelete = (id) => saveAction(() => deleteFoodItem(id));

  const handleGenerateReport = async () => {
    try {
      setError("");
      await downloadFoodReportPdf();
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Could not generate PDF report.");
    }
  };

  const handleAddToCart = (item) => {
    if (item.isOutOfStock) return;

    setCart((prev) => {
      const existing = prev.find((entry) => entry._id === item._id);
      if (existing) {
        return prev.map((entry) => (
          entry._id === item._id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        ));
      }

      return [...prev, {
        _id: item._id,
        foodID: item.foodID,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      }];
    });

    setIsCartOpen(true);
  };

  const handleIncreaseCartItem = (id) => {
    setCart((prev) => prev.map((entry) => (
      entry._id === id
        ? { ...entry, quantity: entry.quantity + 1 }
        : entry
    )));
  };

  const handleDecreaseCartItem = (id) => {
    setCart((prev) => prev
      .map((entry) => (
        entry._id === id
          ? { ...entry, quantity: Math.max(0, entry.quantity - 1) }
          : entry
      ))
      .filter((entry) => entry.quantity > 0));
  };

  const handleRemoveCartItem = (id) => {
    setCart((prev) => prev.filter((entry) => entry._id !== id));
  };

  const cartItemsCount = useMemo(
    () => cart.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0),
    [cart],
  );

  const cartSubTotal = useMemo(
    () => cart.reduce((sum, entry) => sum + (Number(entry.price || 0) * Number(entry.quantity || 0)), 0),
    [cart],
  );

  const cartDeliveryFee = cart.length > 0 ? 400 : 0;
  const cartTotal = cartSubTotal + cartDeliveryFee;

  const handleCheckoutClick = () => {
    navigate("/checkout");
  };

  const handleViewFoodDetails = (item) => {
    setSelectedFoodForModal(item);
  };

  const handleCloseModal = () => {
    setSelectedFoodForModal(null);
  };

  const handleBackFromModal = () => {
    setSelectedFoodForModal(null);
  };

  const handleRateItem = async (item, stars) => {
    if (!item?._id || !Number.isInteger(stars) || stars < 1 || stars > 5) return;

    setStudentRatings((prev) => ({ ...prev, [item._id]: stars }));

    try {
      const response = await rateFoodItem(item._id, stars);

      setItems((prevItems) => prevItems.map((entry) => {
        if (entry._id !== item._id) return entry;

        return {
          ...entry,
          ratingAverage: Number(response?.ratingAverage ?? entry.ratingAverage ?? 0),
          ratingCount: Number(response?.ratingCount ?? entry.ratingCount ?? 0),
        };
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not save your rating.");
    }
  };

  const resetOfferForm = () => {
    setOfferForm(EMPTY_OFFER_FORM);
    setOfferErrors([]);
    setEditingOfferId(null);
    setShowOfferForm(false);
  };

  const validateOfferForm = (form) => {
    const validationErrors = [];

    if (!form.icon.trim()) validationErrors.push("Icon is required.");
    if (!form.title.trim()) validationErrors.push("Offer title is required.");
    if (!form.subtitle.trim()) validationErrors.push("Offer subtitle is required.");
    if (!form.description.trim()) validationErrors.push("Offer description is required.");
    if (!form.buttonLabel.trim()) validationErrors.push("Button label is required.");
    if (!form.image.trim()) {
      validationErrors.push("Image URL is required.");
    } else if (!/^https?:\/\//i.test(form.image.trim())) {
      validationErrors.push("Image URL must start with http:// or https://");
    }

    return validationErrors;
  };

  const handleAddOffer = () => {
    setEditingOfferId(null);
    setOfferForm(EMPTY_OFFER_FORM);
    setOfferErrors([]);
    setShowOfferForm(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOfferId(offer.id);
    setOfferForm({
      icon: offer.icon || "",
      title: offer.title || "",
      subtitle: offer.subtitle || "",
      description: offer.description || "",
      buttonLabel: offer.buttonLabel || "",
      image: offer.image || "",
    });
    setOfferErrors([]);
    setShowOfferForm(true);
  };

  const handleDeleteOffer = (offerId) => {
    setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
    if (editingOfferId === offerId) {
      resetOfferForm();
    }
  };

  const handleOfferFieldChange = (field, value) => {
    setOfferForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOfferSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateOfferForm(offerForm);
    if (validationErrors.length > 0) {
      setOfferErrors(validationErrors);
      return;
    }

    const nextOffer = {
      id: editingOfferId || `offer-${Date.now()}`,
      icon: offerForm.icon.trim(),
      title: offerForm.title.trim(),
      subtitle: offerForm.subtitle.trim(),
      description: offerForm.description.trim(),
      buttonLabel: offerForm.buttonLabel.trim(),
      image: offerForm.image.trim(),
    };

    if (editingOfferId) {
      setOffers((prev) => prev.map((offer) => (offer.id === editingOfferId ? nextOffer : offer)));
    } else {
      setOffers((prev) => [nextOffer, ...prev]);
    }

    resetOfferForm();
  };

  return (
    <div className="food-menu-feature-font font-sans min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {showUserMenuBar ? (
        isLoggedInCustomer ? (
          <CustomerMenuBar
            onLogout={async () => {
              await clearAuthWithAudit();
              navigate("/login");
            }}
            onProfileClick={() => navigate(getProfilePath(getUser()))}
            cartItemsCount={cartItemsCount}
            onCartClick={() => setIsCartOpen(true)}
          />
        ) : (
          <UserMenuBar
            onLogout={async () => {
              await clearAuthWithAudit();
              navigate("/login");
            }}
            onProfileClick={() => navigate(getProfilePath(getUser()))}
          />
        )
      ) : null}
      <main className="pb-10">
      {!isAdmin && !isLoggedInCustomer && (
        <header className="sticky top-0 z-40 border-b border-[#0B8E3A]/10 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link to="/" className="text-2xl font-semibold tracking-tight text-[#0B8E3A] no-underline">
              UNI EATS
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-black md:flex">
              <Link to="/" className="text-black no-underline transition hover:text-black/80">Home</Link>
              <a href="#all-products" className="text-black no-underline transition hover:text-black/80">Our Menu</a>
              <Link to="/group-order" className="text-black no-underline transition hover:text-black/80">Group Order</Link>
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-green-50 text-green-700 shadow-none outline-none ring-0 transition hover:bg-green-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0"
                aria-label={`Open cart (${cartItemsCount} items)`}
              >
                <span className="text-base leading-none" aria-hidden>
                  🛒
                </span>
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border-0 bg-green-600 px-1.5 text-[10px] font-bold text-white shadow-none ring-0">
                  {cartItemsCount}
                </span>
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="text-sm font-semibold text-black no-underline transition hover:text-black/80"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-[#0B8E3A] px-5 py-2.5 text-sm font-semibold !text-white visited:!text-white shadow-md transition hover:bg-[#087532] hover:!text-white"
              >
                Order Now
              </Link>
            </div>
          </div>
        </header>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">

        {!isCategoryPage && (
          <>
            {!isAdmin && (
              <>
                <FeaturedCategories isAdmin={false} categoryCounts={featuredCategoryCounts} />
              </>
            )}
          </>
        )}

        <div className="mt-6">
          <div className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {!isAdmin && !isCategoryPage && (
              <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
                budgetOnly={budgetOnly}
                onBudgetToggle={() => setBudgetOnly((prev) => !prev)}
                hideOutOfStock={hideOutOfStock}
                onOutOfStockToggle={() => setHideOutOfStock((prev) => !prev)}
                scheduleOnly={scheduleOnly}
                onScheduleToggle={() => setScheduleOnly((prev) => !prev)}
                currentMealLabel={currentMealLabel}
              />
            )}

            {isCategoryPage && !isAdmin && (
              <div className="space-y-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Menu
                </button>
                <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Search in {selectedFeaturedCategory.name}</label>
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={`Search ${selectedFeaturedCategory.name}...`}
                    className="w-full rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : isAdmin ? (
              <AdminPanel
                items={isCategoryPage ? featuredItems : items}
                allItems={items}
                isSaving={isSaving}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onRefresh={fetchItems}
                onGeneratePdf={handleGenerateReport}
                initialCategory={selectedFeaturedCategory?.name || "Breakfast"}
                categoryLocked={isCategoryPage}
                categoryOptions={availableCategories}
              />
            ) : (
              <>
                {!isCategoryPage && <PopularProducts items={items} onAddToCart={handleAddToCart} />}

                <div id="all-products" className="mt-8 scroll-mt-28">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isCategoryPage ? selectedFeaturedCategory.name : "All Products"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {filteredItems.length} items found
                    </p>
                  </div>

                  {filteredItems.length ? (
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredItems.map((item) => (
                        <FoodCard
                          key={item._id || item.foodID || item.name}
                          item={item}
                          disabledOutOfStock={item.isOutOfStock && !hideOutOfStock}
                          showAddToCart
                          onAddToCart={() => handleAddToCart(item)}
                          onImageClick={() => handleViewFoodDetails(item)}
                          studentRating={Number(studentRatings[item._id] || 0)}
                          onRate={(stars) => handleRateItem(item, stars)}
                        />
                      ))}
                    </section>
                  ) : (
                    <section className="rounded-3xl border border-dashed border-green-200 bg-white px-6 py-14 text-center">
                      <h3 className="text-lg font-semibold text-slate-900">No food items found</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {isCategoryPage
                          ? `No items are available in ${selectedFeaturedCategory.name} yet.`
                          : "Try changing search, category, or schedule filters."}
                      </p>
                    </section>
                  )}

                  {selectedFoodForModal && (
                    <FoodDetailsModal
                      item={selectedFoodForModal}
                      onClose={handleCloseModal}
                      onBack={handleBackFromModal}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <AnimatePresence>
            {!isAdmin && isCartOpen && (
              <>
                <motion.div
                  key="cart-backdrop"
                  role="presentation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[3px]"
                  onClick={() => setIsCartOpen(false)}
                />
                <motion.aside
                  key="cart-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="food-cart-title"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 320 }}
                  className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-white shadow-[0_0_48px_-12px_rgba(15,23,42,0.25)]"
                >
                  <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-5 pb-5 pt-6 text-white">
                    <div
                      className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                      aria-hidden
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                          <ShoppingBag className="h-5 w-5" strokeWidth={2} aria-hidden />
                        </div>
                        <div>
                          <h3 id="food-cart-title" className="text-lg font-bold tracking-tight">
                            Your cart
                          </h3>
                          <p className="text-sm text-emerald-100">
                            {cartItemsCount === 0
                              ? "No items yet"
                              : `${cartItemsCount} ${cartItemsCount === 1 ? "item" : "items"}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="rounded-xl border-0 bg-white/15 p-2 text-white shadow-none outline-none ring-0 transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0"
                        aria-label="Close cart"
                      >
                        <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/80">
                    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/60 text-slate-400">
                            <ShoppingBag className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                          </div>
                          <p className="text-base font-semibold text-slate-800">Your cart is empty</p>
                          <p className="mt-1 max-w-[240px] text-sm text-slate-500">
                            Add meals from the menu — they&apos;ll show up here.
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {cart.map((entry) => (
                            <li
                              key={entry._id}
                              className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-emerald-200/60 hover:shadow-md"
                            >
                              <div className="flex gap-3">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                  {entry.image ? (
                                    <img
                                      src={entry.image}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                                      <ShoppingBag className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                                      {entry.name}
                                    </p>
                                    <p className="shrink-0 text-sm font-bold tabular-nums text-emerald-700">
                                      Rs.{" "}
                                      {(
                                        Number(entry.price || 0) * Number(entry.quantity || 0)
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="mt-3 flex items-center justify-between gap-2">
                                    <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50 p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleDecreaseCartItem(entry._id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-slate-600 shadow-none outline-none ring-0 transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-0"
                                        aria-label="Decrease quantity"
                                      >
                                        <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
                                      </button>
                                      <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-slate-900">
                                        {entry.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleIncreaseCartItem(entry._id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-slate-600 shadow-none outline-none ring-0 transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-0"
                                        aria-label="Increase quantity"
                                      >
                                        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCartItem(entry._id)}
                                      className="inline-flex items-center gap-1 rounded-full border-0 bg-transparent px-2 py-1 text-xs font-semibold text-rose-600 shadow-none outline-none ring-0 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 focus-visible:ring-offset-0"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="border-t border-slate-200/80 bg-white p-5 shadow-[0_-8px_24px_-8px_rgba(15,23,42,0.08)]">
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span className="font-semibold tabular-nums text-slate-900">
                            Rs. {cartSubTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Delivery</span>
                          <span className="font-semibold tabular-nums text-slate-900">
                            Rs. {cartDeliveryFee.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
                          <span className="font-semibold text-slate-900">Total</span>
                          <span className="text-lg font-bold tabular-nums text-emerald-700">
                            Rs. {cartTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckoutClick}
                        disabled={cart.length === 0}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 outline-none ring-0 transition hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                      >
                        Go to checkout
                      </button>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </div>

      </section>
    </main>
    </div>
  );
}
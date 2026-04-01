import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminPanel from "./components/AdminPanel";
import FilterBar from "./components/FilterBar";
import FoodCard from "./components/FoodCard";
import FoodDetailsModal from "./components/FoodDetailsModal";
import { createFoodItem, deleteFoodItem, getFoodItems, updateFoodItem } from "./api";

const BUDGET_LIMIT = 350;
const CART_STORAGE_KEY = "food_menu_cart";
const OFFERS_STORAGE_KEY = "food_menu_limited_time_offers";

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
    icon: "💰",
    title: "Student Budget Meals",
    subtitle: "Save More on Your Daily Meals",
    description: "Get up to 40% OFF on budget-friendly meals. Perfect for university students.",
    buttonLabel: "Order Now",
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
    icon: "🍱",
    title: "Combo Meal Offers",
    subtitle: "More Food, Less Price",
    description: "Get Rice + Drink + Snack combo deals. Save more with combos.",
    buttonLabel: "View Combos",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
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
  { name: "Soft Drinks", icon: "🧃", items: "11 items", slug: "soft-drinks" },
  { name: "Coffee", icon: "☕", items: "8 items", slug: "coffee" },
  { name: "Milk & Dairy", icon: "🥛", items: "6 items", slug: "milk-dairy" },
  { name: "Water & Juice", icon: "💧", items: "12 items", slug: "water-juice" },
  { name: "Snacks", icon: "🍟", items: "15 items", slug: "snacks" },
  { name: "Sandwiches", icon: "🥪", items: "20 items", slug: "sandwiches" },
  { name: "Burgers", icon: "🍔", items: "7 items", slug: "burgers" },
  { name: "Short Eats", icon: "🌭", items: "5 items", slug: "short-eats" },
  { name: "Pizza", icon: "🍕", items: "4 items", slug: "pizza" },
  { name: "Cakes", icon: "🍰", items: "14 items", slug: "cakes" },
  { name: "Ice Cream", icon: "🍨", items: "14 items", slug: "ice-cream" },
  { name: "Fresh Fruits", icon: "🍎", items: "14 items", slug: "fresh-fruits" },
  { name: "Healthy", icon: "🥗", items: "18 items", slug: "healthy" },
  { name: "Soups", icon: "🍲", items: "18 items", slug: "soups" },
];

function getCurrentMealLabel() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 17) return "Lunch";
  return "Dinner";
}

function normalizeCategory(category = "") {
  if (/budget/i.test(category)) return "Budget Meals";
  if (/veg/i.test(category)) return "Vegetarian";
  if (/breakfast/i.test(category)) return "Breakfast";
  if (/lunch/i.test(category)) return "Lunch";
  if (/dinner/i.test(category)) return "Dinner";
  return category;
}

function normalizeItem(item) {
  const normalizedFoodId = item.foodID || item.FoodID || "";
  const stockText = String(item.stock || "").trim();
  const stockNumber = Number(stockText);
  const hasNumericStock = !Number.isNaN(stockNumber);

  const isOutOfStock = hasNumericStock
    ? stockNumber <= 0
    : /out|unavailable|false|sold/i.test(stockText);

  const lowStock = hasNumericStock
    ? stockNumber > 0 && stockNumber <= 5
    : /low/i.test(stockText);

  const normalizedCategory = normalizeCategory(item.category || "");
  const price = Number(item.price || 0);

  return {
    ...item,
    foodID: normalizedFoodId,
    category: normalizedCategory,
    price,
    isOutOfStock,
    lowStock,
    isPopular: Boolean(item.popular) || Number(item.ordersCount || 0) >= 20,
    isBudgetFriendly: /budget/i.test(normalizedCategory) || price <= BUDGET_LIMIT,
  };
}

function matchesCategory(item, selectedCategory) {
  if (selectedCategory === "All") return true;
  if (selectedCategory === "Vegetarian") {
    return (
      /veg/i.test(item.category || "") ||
      /veg/i.test(item.type || "")
    );
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-lg"
        >
          <div className="h-44 bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-5/6 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedCategories({ isAdmin }) {
  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Featured Categories</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {FEATURED_CATEGORIES.map((category) => {
          const path = isAdmin
            ? `/admin/menu/category/${category.slug}`
            : `/menu/category/${category.slug}`;

          return (
            <Link
              key={category.slug}
              to={path}
              className="group rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all duration-300 hover:border-green-200 hover:shadow-lg"
            >
              <div className="mb-2 text-3xl">{category.icon}</div>
              <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{category.items}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HeroSlideshow() {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
      title: "Fresh Meals Daily",
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

  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-white/60 bg-white shadow-lg">
      <div className="relative h-52 w-full sm:h-64 lg:h-72">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
          >
            <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/15" />
            <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7">
              <h2 className="text-xl font-bold sm:text-3xl">{slide.title}</h2>
              <p className="mt-1 text-sm text-white/90 sm:text-base">{slide.subtitle}</p>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white"
          aria-label="Next slide"
        >
          ›
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${index === activeIndex ? "bg-white" : "bg-white/55"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
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
    <section className="mt-8 rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 via-white to-lime-50 p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-green-900 sm:text-2xl">Limited Time Offers</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={onAddOffer}
            className="rounded-full bg-green-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-green-800"
          >
            Add Offer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {notices.map((notice) => (
          <article
            key={notice.id}
            className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="relative h-44">
              <img
                src={notice.image}
                alt={notice.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-lime-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-green-900">
                Limited Time
              </span>
            </div>

            <div className="space-y-2 p-4">
              <p className="text-sm font-semibold text-green-700">{notice.icon} {notice.title}</p>
              <h3 className="text-lg font-bold text-slate-900">{notice.subtitle}</h3>
              <p className="text-sm text-slate-600">{notice.description}</p>
              <button
                type="button"
                className="mt-1 rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                {notice.buttonLabel}
              </button>

              {isAdmin && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditOffer(notice)}
                    className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800 transition hover:bg-lime-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteOffer(notice.id)}
                    className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeatureCards() {
  const features = [
    {
      title: "Everyday Fresh & Clean with Our Products",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      image: "🥗",
    },
    {
      title: "Make your Breakfast Healthy and Easy",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      image: "🍳",
    },
    {
      title: "Affordable Student Meals",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      image: "💰",
    },
  ];

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      {features.map((feature, idx) => (
        <div
          key={idx}
          className={`${feature.bgColor} cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:shadow-lg`}
        >
          <div className="mb-3 text-4xl">{feature.image}</div>
          <h3 className={`${feature.textColor} mb-3 text-lg font-bold`}>
            {feature.title}
          </h3>
          <button className="text-sm font-medium text-gray-700 hover:underline">
            Shop now →
          </button>
        </div>
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
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {popularItems.map((item, idx) => (
          <div
            key={item._id || idx}
            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl"
          >
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                🍽️
              </div>
              {item.lowStock && (
                <span className="absolute left-3 top-3 rounded-full bg-yellow-500 px-2 py-1 text-xs text-white">
                  Low Stock
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-800">
                {item.name}
              </h3>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">
                  LKR {Number(item.price || 0).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Qty: {item.stock || "0"}
                </span>
              </div>
              <button
                type="button"
                disabled={item.isOutOfStock}
                onClick={() => onAddToCart(item)}
                className={`w-full rounded-full py-2 text-sm font-semibold transition-colors ${
                  item.isOutOfStock
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {item.isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
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

export default function FoodMenu({ isAdmin = false }) {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const selectedFeaturedCategory = useMemo(
    () => getFeaturedCategoryBySlug(categorySlug),
    [categorySlug],
  );

  const isCategoryPage = Boolean(selectedFeaturedCategory);

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [budgetOnly, setBudgetOnly] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);
  const [scheduleOnly, setScheduleOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [offers, setOffers] = useState(DEFAULT_OFFERS);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER_FORM);
  const [offerErrors, setOfferErrors] = useState([]);

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

  const cartCount = useMemo(
    () => cart.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0),
    [cart],
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getFoodItems();
      const normalized = Array.isArray(data) ? data.map(normalizeItem) : [];
      setItems(normalized);
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Could not load food items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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

  const featuredItems = useMemo(() => {
    if (!selectedFeaturedCategory) return items;
    return items.filter((item) => matchesFeaturedCategory(item, selectedFeaturedCategory.name));
  }, [items, selectedFeaturedCategory]);

  const filteredItems = useMemo(() => {
    const sourceItems = isCategoryPage ? featuredItems : items;

    return sourceItems.filter((item) => {
      const searchMatch = item.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
      const categoryMatch = isCategoryPage ? true : matchesCategory(item, selectedCategory);
      const budgetMatch = !budgetOnly || item.isBudgetFriendly;
      const stockMatch = !hideOutOfStock || !item.isOutOfStock;
      const scheduleMatch = !scheduleOnly || item.category === currentMealLabel;

      return searchMatch && categoryMatch && budgetMatch && stockMatch && scheduleMatch;
    });
  }, [items, featuredItems, isCategoryPage, searchTerm, selectedCategory, budgetOnly, hideOutOfStock, scheduleOnly, currentMealLabel]);

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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-10">
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-lime-50 p-6 shadow-lg">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-green-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-lime-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                UNI EATS
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {isAdmin ? "Admin Menu Control" : "Fast & Easy Food Ordering"}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                {isAdmin
                  ? "Modern menu experience with smart filters, live stock state, and meal scheduling."
                  : "Get your meals quickly, anytime on campus or Boardinghouse in just a few taps."}
              </p>
              {selectedFeaturedCategory && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  Category Page: {selectedFeaturedCategory.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {!isAdmin && (
                <Link
                  to="/menu"
                  className="rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                >
                  User View
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/menu"
                  className="rounded-full bg-green-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-800"
                >
                  Admin Panel
                </Link>
              )}
              {!isAdmin && (
                <span className="rounded-full border border-lime-200 bg-lime-50 px-4 py-2 text-xs font-semibold text-lime-800">
                  Cart Items: {cartCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {!isAdmin && <HeroSlideshow />}

        {!isCategoryPage && (
          <>
            <PromoBanner
              notices={offers}
              isAdmin={isAdmin}
              onAddOffer={handleAddOffer}
              onEditOffer={handleEditOffer}
              onDeleteOffer={handleDeleteOffer}
            />

            {isAdmin && showOfferForm && (
              <OfferForm
                form={offerForm}
                errors={offerErrors}
                isEditing={Boolean(editingOfferId)}
                onChange={handleOfferFieldChange}
                onSubmit={handleOfferSubmit}
                onCancel={resetOfferForm}
              />
            )}

            {!isAdmin && (
              <>
                <FeaturedCategories isAdmin={false} />
                <FeatureCards />
              </>
            )}
          </>
        )}

        {isAdmin && !isCategoryPage && <FeaturedCategories isAdmin />}

        <div className="mt-6 space-y-6">
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
              isSaving={isSaving}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onRefresh={fetchItems}
              initialCategory={selectedFeaturedCategory?.name || "Breakfast"}
              categoryLocked={isCategoryPage}
              categoryOptions={availableCategories}
            />
          ) : (
            <>
              {!isCategoryPage && <PopularProducts items={items} onAddToCart={handleAddToCart} />}

              <div className="mt-8">
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
      </section>
    </main>
  );
}

function OfferForm({
  form,
  errors,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="mt-4 rounded-2xl border border-green-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-lg font-bold text-slate-900">
        {isEditing ? "Edit Offer" : "Add New Offer"}
      </h3>

      {errors.length > 0 && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-semibold text-rose-700">Please fix these issues:</p>
          <ul className="mt-1 space-y-1 text-sm text-rose-600">
            {errors.map((error, index) => (
              <li key={index}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          value={form.icon}
          onChange={(event) => onChange("icon", event.target.value)}
          placeholder="Icon (e.g. 💰)"
          className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
        />
        <input
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="Offer title"
          className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
        />
        <input
          value={form.subtitle}
          onChange={(event) => onChange("subtitle", event.target.value)}
          placeholder="Offer subtitle"
          className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500 md:col-span-2"
        />
        <textarea
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Offer description"
          rows="3"
          className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500 md:col-span-2"
        />
        <input
          value={form.buttonLabel}
          onChange={(event) => onChange("buttonLabel", event.target.value)}
          placeholder="Button label"
          className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
        />
        <input
          value={form.image}
          onChange={(event) => onChange("image", event.target.value)}
          placeholder="Image URL"
          className="rounded-xl border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-500"
        />

        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            {isEditing ? "Update Offer" : "Save Offer"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
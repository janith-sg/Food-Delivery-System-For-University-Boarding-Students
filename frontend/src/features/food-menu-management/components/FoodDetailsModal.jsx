import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, X, Star, Clock, Flame, Leaf, 
  Shield, Zap, Package, TrendingUp, Award,
  Heart, Share2, Bookmark, Info, CheckCircle,
  AlertCircle, Droplet, Coffee, Pizza, Sandwich,
  Cake, Apple, Salad, Soup, Utensils, HeartHandshake
} from "lucide-react";
import { getImageUrl } from "../api";

function formatCurrency(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function showValue(value, fallback = "Not provided") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

const spiceLevelConfig = {
  Mild: { icon: <Leaf size={16} />, color: "from-green-400 to-emerald-500", peppers: "🌱", level: 1 },
  Medium: { icon: <Flame size={16} />, color: "from-yellow-400 to-orange-500", peppers: "🌶️", level: 2 },
  Hot: { icon: <Flame size={16} />, color: "from-orange-500 to-red-500", peppers: "🌶️🌶️", level: 3 },
  "Very Hot": { icon: <Zap size={16} />, color: "from-red-500 to-rose-600", peppers: "🌶️🌶️🌶️", level: 4 },
};

const dietTypeConfig = {
  Vegetarian: { icon: <Leaf size={16} />, color: "from-green-400 to-emerald-500", bg: "bg-green-50" },
  "Non-Vegetarian": { icon: <Utensils size={16} />, color: "from-red-400 to-rose-500", bg: "bg-red-50" },
  Vegan: { icon: <Leaf size={16} />, color: "from-teal-400 to-green-500", bg: "bg-teal-50" },
};

function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 shadow-lg`}
    >
      <div className="absolute top-0 right-0 opacity-10">
        <Icon size={40} />
      </div>
      <div className="relative z-10">
        <p className="text-white/80 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white text-xl font-bold mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100"
    >
      <div className={`p-2 rounded-lg bg-gradient-to-r ${color} text-white`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

function NutritionPill({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${color} text-white shadow-md`}
    >
      <Icon size={14} />
      <span className="text-xs font-semibold">{label}:</span>
      <span className="text-xs">{value}</span>
    </motion.div>
  );
}

export default function FoodDetailsModal({ item, onClose, onBack }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!item) return null;

  const spiceConfig = spiceLevelConfig[item.spiceLevel] || spiceLevelConfig.Mild;
  const dietConfig = dietTypeConfig[item.dietType] || dietTypeConfig.Vegetarian;
  const ratingPercentage = (item.ratingAverage / 5) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 transition-all"
            >
              <ChevronLeft size={18} />
              Back to Menu
            </motion.button>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-full hover:bg-red-50 transition-colors"
              >
                <Heart className={`w-5 h-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 rounded-full hover:bg-blue-50 transition-colors"
              >
                <Bookmark className={`w-5 h-5 transition-colors ${isBookmarked ? "fill-blue-500 text-blue-500" : "text-gray-400"}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <X size={20} className="text-gray-500" />
              </motion.button>
            </div>
          </motion.div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Hero Section with Image */}
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden rounded-2xl shadow-2xl"
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="w-full h-80 object-cover"
                  onLoad={() => setImageLoaded(true)}
                  onError={(event) => {
                    event.currentTarget.src = "https://placehold.co/640x420?text=Food+Image";
                  }}
                />
              </motion.div>
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                {item.isPopular && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm" />
                    <span className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-xs font-bold text-white">
                      <TrendingUp size={14} />
                      Most Popular
                    </span>
                  </motion.div>
                )}
                {item.isBudgetFriendly && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs font-bold text-white shadow-lg">
                      <Zap size={14} />
                      Budget Friendly
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Title & Rating Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-b border-gray-100 pb-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {item.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-gray-400">per serving</p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-gray-800">{item.ratingAverage.toFixed(1)}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <span className="text-sm text-gray-500">
                    {item.ratingCount} {item.ratingCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">Top Rated Item</span>
                </div>
              </div>
              
              {/* Rating Bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratingPercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={Flame}
                label="Calories"
                value={showValue(item.calories, "N/A")}
                gradient="from-orange-500 to-red-500"
                delay={0.15}
              />
              <StatCard
                icon={Shield}
                label="Protein"
                value={showValue(item.protein, "N/A")}
                gradient="from-blue-500 to-cyan-500"
                delay={0.2}
              />
              <StatCard
                icon={Clock}
                label="Prep Time"
                value={showValue(item.preparationTime, "N/A")}
                gradient="from-purple-500 to-pink-500"
                delay={0.25}
              />
              <StatCard
                icon={Package}
                label="Stock"
                value={item.stock > 0 ? `${item.stock} units` : "Out of Stock"}
                gradient={item.stock > 0 ? "from-green-500 to-emerald-500" : "from-gray-500 to-gray-600"}
                delay={0.3}
              />
            </div>

            {/* Info Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow 
                icon={spiceConfig.icon}
                label="Spice Level"
                value={
                  <div className="flex items-center gap-2">
                    <span>{spiceConfig.peppers}</span>
                    <span className="font-semibold">{item.spiceLevel}</span>
                  </div>
                }
                color={spiceConfig.color}
              />
              <InfoRow 
                icon={dietConfig.icon}
                label="Diet Type"
                value={item.dietType}
                color={dietConfig.color}
              />
              <InfoRow 
                icon={Utensils}
                label="Serving Type"
                value={showValue(item.servingType)}
                color="from-indigo-500 to-purple-500"
              />
              <InfoRow 
                icon={Package}
                label="Portion Size"
                value={showValue(item.portionSize)}
                color="from-teal-500 to-green-500"
              />
              <InfoRow 
                icon={Clock}
                label="Best Before"
                value={showValue(item.bestBefore)}
                color="from-yellow-500 to-amber-500"
              />
              <InfoRow 
                icon={Award}
                label="Food Type"
                value={showValue(item.type)}
                color="from-rose-500 to-pink-500"
              />
            </div>

            {/* Ingredients Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl bg-gradient-to-br from-gray-50 to-white p-6 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Leaf size={16} />
                </div>
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients?.split(',').map((ingredient, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1.5 bg-white rounded-full text-sm text-gray-700 shadow-sm border border-gray-200"
                  >
                    {ingredient.trim()}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Info size={16} />
                </div>
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                {showValue(item.description)}
              </p>
            </motion.div>

            {/* Nutrition Facts */}
            {(item.protein || item.calories) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="border-t border-gray-100 pt-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <Flame size={16} />
                  </div>
                  Nutrition Facts
                </h3>
                <div className="flex flex-wrap gap-3">
                  {item.protein && (
                    <NutritionPill 
                      label="Protein" 
                      value={item.protein}
                      icon={Shield}
                      color="from-blue-500 to-cyan-500"
                    />
                  )}
                  {item.calories && (
                    <NutritionPill 
                      label="Calories" 
                      value={item.calories}
                      icon={Flame}
                      color="from-orange-500 to-red-500"
                    />
                  )}
                  {item.spiceLevel && (
                    <NutritionPill 
                      label="Spice" 
                      value={item.spiceLevel}
                      icon={Zap}
                      color="from-red-500 to-rose-500"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* Stock Status & Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                  item.isOutOfStock
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {item.isOutOfStock ? (
                    <>
                      <AlertCircle size={16} />
                      Out of Stock
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      In Stock
                    </>
                  )}
                </div>
                {!item.isOutOfStock && item.lowStock && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle size={14} />
                    <span className="text-xs">Only {item.stock} left!</span>
                  </div>
                )}
              </div>
              
              {!item.isOutOfStock && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Add to Cart
                </motion.button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Leaf, Package, Star, Tag, Heart, 
  Clock, TrendingUp, Shield, Sparkles, Crown,
  Eye, ShoppingBag, Zap, Award, Coffee, Pizza,
  Sandwich, Cake, Apple, Salad, Soup, Droplet,
  CheckCircle, Info
} from "lucide-react";
import { getImageUrl } from "../api";

function formatCurrency(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

const categoryColors = {
  Breakfast: "from-orange-400 to-amber-500",
  Lunch: "from-green-400 to-emerald-500",
  Dinner: "from-purple-400 to-indigo-500",
  "Budget Meals": "from-blue-400 to-cyan-500",
  Vegetarian: "from-emerald-400 to-green-500",
  "Soft Drinks": "from-cyan-400 to-blue-500",
  Coffee: "from-amber-600 to-amber-700",
  "Milk & Dairy": "from-blue-300 to-sky-400",
  "Water & Juice": "from-sky-400 to-cyan-300",
  Snacks: "from-orange-400 to-amber-300",
  Sandwiches: "from-yellow-500 to-orange-400",
  Burgers: "from-red-600 to-orange-500",
  "Short Eats": "from-rose-500 to-pink-400",
  Pizza: "from-red-500 to-rose-400",
  Cakes: "from-pink-400 to-rose-300",
  "Ice Cream": "from-purple-400 to-pink-300",
  "Fresh Fruits": "from-green-400 to-emerald-300",
  Healthy: "from-emerald-500 to-green-400",
  Soups: "from-amber-400 to-yellow-300",
};

const getCategoryColor = (category) => {
  return categoryColors[category] || "from-gray-500 to-gray-600";
};

function ParticleEffect({ isHovered }) {
  if (!isHovered) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: "50%",
            y: "50%",
            opacity: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 200}%`,
            y: `${50 + (Math.random() - 0.5) * 200}%`,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

function NutritionBadge({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r ${color} text-white text-xs font-medium shadow-sm`}
    >
      <Icon size={12} />
      <span>{label}: {value}</span>
    </motion.div>
  );
}

export default function FoodCard({
  item,
  disabledOutOfStock,
  showAddToCart = false,
  onAddToCart,
  onImageClick,
  studentRating = 0,
  onRate,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const categoryGradient = getCategoryColor(item.category);
  const isVeg = item.type?.toLowerCase().includes("veg") || item.dietType === "Vegetarian";
  const ratingPercentage = (item.ratingAverage / 5) * 100;

  const handleAddToCart = () => {
    if (onAddToCart && !item.isOutOfStock) {
      onAddToCart(item, 1);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative ${disabledOutOfStock ? "opacity-60" : ""}`}
    >
      <ParticleEffect isHovered={isHovered} />
      
      <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ${
        isHovered ? "shadow-2xl" : ""
      }`}>
        
        {/* 3D Rotating Image Container */}
        <div className="relative h-36 overflow-hidden cursor-pointer group/image">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
            onClick={onImageClick}
          >
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "https://placehold.co/640x420?text=Food+Image";
              }}
            />
          </motion.div>
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-80"
          }`} />
          
          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {item.isPopular && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm" />
                <span className="relative inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-[10px] font-bold text-white shadow-lg">
                  <Flame size={14} />
                  Popular
                </span>
              </motion.div>
            )}
            
            {item.isBudgetFriendly && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-[10px] font-bold text-white shadow-lg">
                  <Zap size={14} />
                  Budget Deal
                </span>
              </motion.div>
            )}
            
            {item.isOutOfStock && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full text-[10px] font-bold text-white shadow-lg">
                  <Package size={14} />
                  Out of Stock
                </span>
              </motion.div>
            )}
          </div>
          
          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            onClick={() => setShowDetails(!showDetails)}
            className="absolute bottom-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all"
          >
            <Eye size={16} className="text-gray-700" />
          </motion.button>
          
          {/* Price Tag */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute bottom-2 left-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur-sm" />
              <span className="relative block px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-[11px] font-bold text-white shadow-lg">
                {formatCurrency(item.price)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2.5">
          {/* Title & Rating */}
          <div>
            <div className="mb-1 flex items-start justify-between gap-2">
              <motion.h3 
                className="text-base font-bold text-gray-800 line-clamp-1"
                whileHover={{ scale: 1.02 }}
              >
                {item.name}
              </motion.h3>
              {isVeg && (
                <Leaf size={16} className="text-green-600 flex-shrink-0" />
              )}
            </div>
            
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${categoryGradient} text-white font-medium`}>
                {item.category}
              </span>
              <span className="text-[10px] text-gray-500">{item.portion || "Standard"}</span>
            </div>
            
            {/* Rating Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-700">
                    {item.ratingAverage.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    ({item.ratingCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500">{item.preparationTime || "15-20 min"}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ratingPercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${categoryGradient}`}
                />
              </div>
            </div>
          </div>

          {/* Description Preview */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <p className="text-[11px] text-gray-600 line-clamp-2">
                  {item.description || "Delicious food prepared with fresh ingredients and love."}
                </p>
                
                {/* Nutrition Info */}
                {(item.protein || item.calories || item.spiceLevel) && (
                  <div className="flex flex-wrap gap-2">
                    {item.protein && (
                      <NutritionBadge 
                        icon={Shield} 
                        label="Protein" 
                        value={item.protein}
                        color="from-blue-500 to-cyan-500"
                      />
                    )}
                    {item.calories && (
                      <NutritionBadge 
                        icon={Flame} 
                        label="Calories" 
                        value={item.calories}
                        color="from-orange-500 to-red-500"
                      />
                    )}
                    {item.spiceLevel && (
                      <NutritionBadge 
                        icon={Zap} 
                        label="Spice" 
                        value={item.spiceLevel}
                        color="from-red-500 to-rose-500"
                      />
                    )}
                  </div>
                )}
                
                {/* Diet Info */}
                {(item.dietType || item.servingType) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Award size={14} />
                    <span>{item.dietType || "Vegetarian"} • {item.servingType || "Hot meal"}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Student Rating Section */}
          {showDetails && (
            <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 px-2 py-1.5">
              <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold text-gray-600">
                <Sparkles size={9} className="text-yellow-500" />
                Rate this item
              </p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  const active = starValue <= studentRating;

                  return (
                    <motion.button
                      key={starValue}
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => onRate?.(starValue)}
                      aria-label={`Rate ${starValue} stars`}
                      className="rounded-full p-0 transition outline-none border-0"
                    >
                      <Star
                        size={13}
                        className={`transition-all ${
                          active
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                            : "text-gray-300 hover:text-yellow-300"
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          {item.lowStock && !item.isOutOfStock && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 rounded-xl bg-orange-50 px-2 py-1.5"
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-orange-700">
                Only {item.stock} left in stock! Order soon.
              </span>
            </motion.div>
          )}

          {/* Add to Cart Section */}
          {showAddToCart && (
            <div className="space-y-1.5">
              <motion.button
                whileHover={!item.isOutOfStock ? { scale: 1.02 } : {}}
                whileTap={!item.isOutOfStock ? { scale: 0.98 } : {}}
                disabled={item.isOutOfStock}
                onClick={handleAddToCart}
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold transition-all duration-300 ${
                  item.isOutOfStock
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {item.isOutOfStock ? (
                  <>
                    <Package size={16} />
                    Out of Stock
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Add to Cart • {formatCurrency(item.price)}
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>

        {/* Corner Decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${categoryGradient} opacity-10 transform rotate-45 translate-x-10 -translate-y-10`} />
        </div>
      </div>
    </motion.article>
  );
}

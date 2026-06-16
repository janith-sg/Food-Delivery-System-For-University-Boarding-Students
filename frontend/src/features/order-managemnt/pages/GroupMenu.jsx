import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { getImageUrl } from "../../food-menu-management/api";
import CustomerMenuBar from "../../user-management/components/CustomerMenuBar";
import { clearAuthWithAudit, getUser } from "../../../lib/auth";
import { getProfilePath } from "../../../lib/postLoginRedirect";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const tagColors = {
  Popular: "bg-amber-100 text-amber-700",
  "Budget Pick": "bg-sky-100 text-sky-700",
  "Best Value": "bg-emerald-100 text-emerald-700",
  "Family Size": "bg-purple-100 text-purple-700",
};

const parseItemId = (item, fallback) => {
  const idFromFoodId = Number(String(item.foodID || item.FoodID || "").replace(/[^0-9]/g, ""));
  if (Number.isFinite(idFromFoodId) && idFromFoodId > 0) return idFromFoodId;

  const idFromMongo = Number(String(item._id || "").slice(-6).replace(/[^0-9]/g, ""));
  if (Number.isFinite(idFromMongo) && idFromMongo > 0) return idFromMongo;

  return fallback + 1;
};

const getTagForItem = (item) => {
  if ((item.ordersCount || 0) >= 20 || item.popular) return "Popular";
  if (Number(item.price || 0) <= 1500) return "Budget Pick";
  if (Number(item.ratingAverage || 0) >= 4.5) return "Best Value";
  return "Family Size";
};

const GroupMenu = ({ groupCode, memberName, onBackToGroups, onViewSummary }) => {
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [addedMap, setAddedMap] = useState({});
  const [loadingRemove, setLoadingRemove] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const response = await fetch(apiUrl("/api/foodmenus"));
      const data = await response.json().catch(() => []);
      const sourceItems = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

      const mapped = sourceItems.map((item, index) => ({
        id: parseItemId(item, index),
        _id: item._id || item.foodID || item.id || parseItemId(item, index),
        foodID: item.foodID || item.FoodID,
        name: item.name || `Food Item ${index + 1}`,
        price: Number(item.price || 0),
        image: getImageUrl(item.image),
        description: item.description || "Fresh menu item",
        category: item.category || "Lunch",
        type: item.type || "Regular",
        ratingAverage: Number(item.ratingAverage || 0),
        ratingCount: Number(item.ratingCount || 0),
        stock: item.stock,
        tag: getTagForItem(item),
        isOutOfStock: Number(item.stock || 0) <= 0 || /out|unavailable|false|sold/i.test(String(item.stock || "")),
      }));

      setMenuItems(mapped);
    } catch (error) {
      console.error(error);
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const fetchGroup = async () => {
    try {
      const res = await fetch(apiUrl(`/api/group-orders/${groupCode}`));
      const data = await res.json();
      if (res.ok) setGroupData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (groupCode) fetchGroup();
  }, [groupCode]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCartOpen]);

  const addToGroupCart = async (item) => {
    try {
      const response = await fetch(apiUrl("/api/group-orders/add-item"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupCode,
          item: { addedBy: memberName, itemId: item.id, name: item.name, price: item.price, qty: 1 },
        }),
      });
      if (response.ok) {
        setAddedMap((p) => ({ ...p, [item.id]: true }));
        setTimeout(() => setAddedMap((p) => ({ ...p, [item.id]: false })), 1200);
        setIsCartOpen(true);
        fetchGroup();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateItemQty = async (itemId, action) => {
    try {
      const response = await fetch(apiUrl("/api/group-orders/update-item"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode, itemId, action }),
      });
      if (response.ok) fetchGroup();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (itemId) => {
    setLoadingRemove((p) => ({ ...p, [itemId]: true }));
    try {
      const response = await fetch(apiUrl("/api/group-orders/remove-item"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode, itemId }),
      });
      if (response.ok) fetchGroup();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRemove((p) => ({ ...p, [itemId]: false }));
    }
  };

  const getSubTotal = () => {
    if (!groupData?.items?.length) return 0;
    return groupData.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const deliveryFee = groupData?.deliveryFee || 200;
  const finalTotal = getSubTotal() + deliveryFee;
  const totalItems = groupData?.items?.reduce((s, i) => s + i.qty, 0) || 0;

  const getQty = (menuItem) => {
    if (!groupData?.items?.length) return 0;
    return groupData.items.reduce((sum, item) => {
      const menuId = String(menuItem._id || menuItem.foodID || menuItem.id || "");
      const groupItemId = String(item.itemId || item._id || "");
      if (groupItemId === menuId || item.name === menuItem.name) {
        return sum + Number(item.qty || 0);
      }
      return sum;
    }, 0);
  };

  const getCartItemImage = (cartItem) => {
    const itemImage = cartItem?.image;
    if (itemImage) {
      return getImageUrl(itemImage);
    }

    const cartItemId = String(cartItem?.itemId || cartItem?._id || "");
    const match = menuItems.find((menuItem) => {
      const menuId = String(menuItem._id || menuItem.foodID || menuItem.id || "");
      return menuId && cartItemId && menuId === cartItemId;
    }) || menuItems.find((menuItem) => menuItem.name === cartItem?.name);

    return match?.image || "";
  };

  return (
    <>
      <CustomerMenuBar
        onLogout={async () => {
          await clearAuthWithAudit();
          navigate("/login");
        }}
        onProfileClick={() => navigate(getProfilePath(getUser()))}
        cartItemsCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
      />
      <div className="font-sans">
      <div className="space-y-5 rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between rounded-2xl bg-green-600 px-6 py-5 shadow-md shadow-emerald-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100 mb-1">
              Group Order
            </p>
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Group Order Menu
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Code: <span className="font-mono tracking-widest">{groupCode}</span>
              </span>
              <span className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                👤 {memberName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block"></span>
              <span className="text-sm font-semibold">Kitchen Open</span>
            </div>
            <button
              type="button"
              onClick={onBackToGroups}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Back to group order"
            >
              ←
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loadingMenu ? (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              Loading food menu...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No food menu items available.
            </div>
          ) : menuItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative overflow-hidden h-44">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${tagColors[item.tag]}`}
                >
                  {item.tag}
                </span>
                {getQty(item) > 0 && (
                  <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {getQty(item)}
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-1 p-4 gap-2">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 flex-1 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-extrabold text-gray-900">
                    Rs. <span className="text-green-700">{item.price.toLocaleString()}</span>
                  </span>
                </div>
                <button
                  onClick={() => addToGroupCart(item)}
                  disabled={item.isOutOfStock}
                  className={`mt-1 w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-300 border-none cursor-pointer ${
                    item.isOutOfStock
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : addedMap[item.id]
                        ? "bg-green-100 text-green-700 scale-95"
                        : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                  }`}
                >
                  {item.isOutOfStock ? "Out of Stock" : addedMap[item.id] ? "✓ Added!" : "+ Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[3px]"
              onClick={() => setIsCartOpen(false)}
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="group-cart-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-white shadow-[0_0_48px_-12px_rgba(15,23,42,0.25)]"
            >
              <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-5 pb-5 pt-6 text-white">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                      <ShoppingBag className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </div>
                    <div>
                      <h3 id="group-cart-title" className="text-lg font-bold tracking-tight">Your cart</h3>
                      <p className="text-sm text-emerald-100">
                        {totalItems === 0 ? "No items yet" : `${totalItems} ${totalItems === 1 ? "item" : "items"}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-xl border-0 bg-white/15 p-2 text-white shadow-none outline-none ring-0 transition hover:bg-white/25"
                    aria-label="Close cart"
                  >
                    <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/80">
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                  {!groupData?.items?.length ? (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/60 text-slate-400">
                        <ShoppingBag className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                      </div>
                      <p className="text-base font-semibold text-slate-800">Your cart is empty</p>
                      <p className="mt-1 max-w-[240px] text-sm text-slate-500">
                        Add meals from the menu and they will show here.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {groupData.items.map((item, index) => {
                        const itemKey = item._id || item.itemId || `${item.name}-${index}`;
                        const itemId = item._id || item.itemId;
                        const isRemoving = loadingRemove[itemId];
                        const imageSrc = getCartItemImage(item);

                        return (
                          <li
                            key={itemKey}
                            className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-emerald-200/60 hover:shadow-md"
                          >
                            <div className="flex gap-3">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                {imageSrc ? (
                                  <img src={imageSrc} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                                    <ShoppingBag className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="shrink-0 text-sm font-bold tabular-nums text-emerald-700">
                                    Rs. {(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString()}
                                  </p>
                                </div>

                                <p className="mt-1 text-xs text-slate-400">Added by {item.addedBy}</p>

                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50 p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => itemId && updateItemQty(itemId, "decrease")}
                                      className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-slate-600 transition hover:bg-white hover:text-slate-900"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
                                    </button>
                                    <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-slate-900">
                                      {item.qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => itemId && updateItemQty(itemId, "increase")}
                                      className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-slate-600 transition hover:bg-white hover:text-slate-900"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => itemId && removeItem(itemId)}
                                    disabled={!itemId || isRemoving}
                                    className="inline-flex items-center gap-1 rounded-full border-0 bg-transparent px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                                    {isRemoving ? "..." : "Remove"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="border-t border-slate-200/80 bg-white p-5 shadow-[0_-8px_24px_-8px_rgba(15,23,42,0.08)]">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold tabular-nums text-slate-900">Rs. {getSubTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Delivery</span>
                      <span className="font-semibold tabular-nums text-slate-900">Rs. {deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="text-lg font-bold tabular-nums text-emerald-700">Rs. {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onViewSummary}
                    disabled={!groupData?.items?.length}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
    </>
  );
};

export default GroupMenu;


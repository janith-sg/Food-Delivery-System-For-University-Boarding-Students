import React, { useEffect, useState } from "react";
import { getImageUrl } from "../../food-menu-management/api";

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
  const [groupData, setGroupData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [addedMap, setAddedMap] = useState({});
  const [loadingRemove, setLoadingRemove] = useState({});

  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const response = await fetch(apiUrl("/api/foodmenus"));
      const data = await response.json().catch(() => []);
      const sourceItems = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

      const mapped = sourceItems.map((item, index) => ({
        id: parseItemId(item, index),
        name: item.name || `Food Item ${index + 1}`,
        price: Number(item.price || 0),
        image: getImageUrl(item.image),
        description: item.description || "Fresh menu item",
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

  const deliveryFee = groupData?.deliveryFee || 400;
  const finalTotal = getSubTotal() + deliveryFee;
  const totalItems = groupData?.items?.reduce((s, i) => s + i.qty, 0) || 0;

  const calculateSplit = () => {
    if (!groupData?.items?.length) return [];
    const memberTotals = {};
    groupData.items.forEach((item) => {
      memberTotals[item.addedBy] = (memberTotals[item.addedBy] || 0) + item.price * item.qty;
    });
    const members = Object.keys(memberTotals);
    const share = members.length > 0 ? deliveryFee / members.length : 0;
    return members.map((m) => ({
      name: m,
      subTotal: memberTotals[m],
      delivery: share,
      total: memberTotals[m] + share,
    }));
  };

  const splitData = calculateSplit();

  return (
    <div className="font-sans grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      {/* LEFT: Header + Menu */}
      <div className="space-y-5">

        {/* Page Header */}
        <div className="rounded-2xl bg-green-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">
              Group Order
            </p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">Group Menu 🍗</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Code: <span className="font-mono tracking-widest">{groupCode}</span>
              </span>
              <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
                👤 {memberName}
              </span>
            </div>
          </div>
          <button
            onClick={onBackToGroups}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition border-none cursor-pointer"
          >
            ←
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
          {loadingMenu ? (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              Loading food menu...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No food menu items available.
            </div>
          ) : menuItems.map((item) => {
            const isAdded = addedMap[item.id];
            return (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden h-40">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${tagColors[item.tag]}`}>
                    {item.tag}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-4 gap-2">
                  <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-500 flex-1">{item.description}</p>
                  <p className="text-lg font-extrabold text-green-700">
                    Rs. {item.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => addToGroupCart(item)}
                    disabled={item.isOutOfStock}
                    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-300 border-none cursor-pointer
                      ${isAdded
                        ? "bg-green-100 text-green-700 scale-95"
                        : item.isOutOfStock
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                      }`}
                  >
                    {item.isOutOfStock ? "Out of Stock" : isAdded ? "✓ Added to Group!" : "+ Add to Group Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Group Cart */}
      <div className="sticky top-5 self-start rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden">
        {/* Cart Header */}
        <div className="bg-green-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h2 className="text-base font-extrabold text-white">Group Cart</h2>
          </div>
          {totalItems > 0 && (
            <span className="bg-white text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-5">
          {!groupData?.items?.length ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl">🍽️</div>
              <p className="font-semibold text-gray-700 text-sm">Group cart is empty</p>
              <p className="text-xs text-gray-400">Add items from the menu above</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-3 mb-4">
                {groupData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">by {item.addedBy}</p>
                      </div>
                      <span className="text-sm font-extrabold text-green-700">
                        Rs. {(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Rs. {item.price.toLocaleString()} each</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateItemQty(item._id, "decrease")}
                          className="w-8 h-8 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition cursor-pointer border-none bg-transparent"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                        <button
                          onClick={() => updateItemQty(item._id, "increase")}
                          className="w-8 h-8 flex items-center justify-center text-green-600 font-bold hover:bg-green-50 transition cursor-pointer border-none bg-transparent"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        disabled={loadingRemove[item._id]}
                        className="text-xs text-red-400 hover:text-red-600 font-semibold transition cursor-pointer border-none bg-transparent disabled:opacity-50"
                      >
                        {loadingRemove[item._id] ? "..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs. {getSubTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-green-200 pt-2 flex justify-between">
                  <span className="font-extrabold text-gray-900">Total</span>
                  <span className="font-extrabold text-green-700 text-base">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bill Split */}
              {splitData.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                    💰 Bill Split
                  </h3>
                  <div className="space-y-2">
                    {splitData.map((member, i) => (
                      <div key={i} className="rounded-xl bg-white border border-gray-200 px-3 py-2.5 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">
                            Food: Rs. {member.subTotal.toLocaleString()} + Delivery: Rs. {member.delivery.toFixed(0)}
                          </p>
                        </div>
                        <span className="text-sm font-extrabold text-green-700">
                          Rs. {member.total.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Summary */}
              <button
                onClick={onViewSummary}
                className="w-full rounded-xl bg-green-600 py-3 text-sm font-extrabold text-white hover:bg-green-700 active:scale-95 transition-all border-none cursor-pointer shadow-md shadow-green-200"
              >
                View Order Summary →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMenu;

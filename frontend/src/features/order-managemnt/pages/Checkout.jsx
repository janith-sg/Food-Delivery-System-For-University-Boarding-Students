import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Search, MapPin } from "lucide-react";
import StripePaymentForm from "./StripePaymentForm";
import generateOrderInvoice from "../utils/generateOrderInvoice";
import UserMenuBar from "../../user-management/components/UserMenuBar";
import CustomerMenuBar from "../../user-management/components/CustomerMenuBar";
import { clearAuthWithAudit, getToken, getUser } from "../../../lib/auth";
import { getProfilePath } from "../../../lib/postLoginRedirect";

const CART_STORAGE_KEY = "food_menu_cart";
const PURCHASED_ITEMS_KEY = "food_menu_purchased_items";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const Checkout = ({ onBack }) => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext) || {};
  const showUserMenuBar = Boolean(getToken()) && getUser()?.accountType === "customer";
  const isLoggedInCustomer = Boolean(getToken()) && getUser()?.accountType === "customer";
  const [localCartItems, setLocalCartItems] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    searchLocation: "",
    address: "",
    paymentMethod: "Cash on Delivery",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [stripeReady, setStripeReady] = useState(false);
  const [cardPaymentUnavailable, setCardPaymentUnavailable] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const mockLocations = [
    "🏢 SLIIT New Kandy Road, Malabe",
    "🏢 New Faculty Building SLIIT Malabe",
    "🏫 SLIIT Northern Campus",
    "🏥 SLIIT Nursing Building",
    "📚 Faculty of Humanities & Sciences Sri Lanka",
    "🏛️ SLIIT Colombo Campus",
    "🏢 SLIIT Matara Campus",
    "🛏️ SLIIT Hostel 1 Malabe",
    "🛏️ SLIIT Hostel 2 Malabe",
    "🛏️ SLIIT Hostel 3 Malabe",    "🛏️ SLIIT Hostel 4 Malabe",
    "🛏️ SLIIT Hostel 5 Malabe",
    "🛏️ SLIIT Hostel 6 Malabe",
    "🛏️ SLIIT Hostel 7 Malabe",
    "🛏️ SLIIT Hostel 8 Malabe",
    "🏫 SLIIT Library Malabe",
    "🏫 SLIIT IT Building Malabe",
    "🏫 SLIIT Engineering Building Malabe",
    "🍽️ SLIIT Cafeteria Main Malabe",
    "🍽️ SLIIT Cafeteria Annex Malabe",
    "🏪 SLIIT Bookshop Malabe",
    "⚽ SLIIT Sports Complex Malabe",
    "🏥 SLIIT Health Center Malabe",
    "🅿️ SLIIT Parking A Malabe",
    "🅿️ SLIIT Parking B Malabe",
    "🚗 Malabe Junction",
    "🛣️ New Kandy Road",
    "🛣️ Colombo Kandy Road",
    "🛣️ High Level Road Malabe",
    "🏘️ Malabe Town",
    "🏘️ Malabe Central",
    "🏘️ Malabe North",
    "🏘️ Malabe South",
    "🏘️ Malabe East",
    "🏘️ Malabe West",
    "🏘️ Peradeniya Road Malabe",
    "🏘️ Colombo District",
    "🏘️ Kandy District",
    "🏘️ Central Province",
    "📫 Malabe Post Office",
    "🏦 Malabe Bank",
    "🏥 Malabe Hospital",
    "🏥 General Hospital Colombo",
    "🏥 Teaching Hospital Peradeniya",
    "🚌 Malabe Bus Station",
    "🚌 Colombo Fort Railway Station",
    "🏫 University of Peradeniya",
    "🏢 Sri Lanka Institute of Information Technology",
    "🏘️ Maharagama",
    "🏘️ Nugegoda",
    "🏘️ Colombo 7",
    "🏘️ Colombo 5",
    "🏘️ Colombo 3",
    "🏘️ Colombo 1",
    "🏘️ Galle Road",
    "🏘️ Braybrooke Place",
    "🏘️ Mullaitivu",
    "🏘️ Kiribathgoda",
    "🏘️ Yakkala",
    "🏘️ Aswathama",
    "🏘️ Kesbewa",
    "🏘️ Dehiwala",
    "🏘️ Mount Lavinia",
    "🏘️ Moratuwa",
    "🏘️ Ratmalana",
    "🏘️ Kalutara",
    "🏘️ Galle",
    "🏘️ Matara",
    "🏘️ Dambulla",
    "🏘️ Kandy City",
    "🏘️ Anuradhapura",
    "🏘️ Jaffna",
    "📍 Gate A SLIIT",
    "📍 Gate B SLIIT",
    "📍 Main Entrance SLIIT",
    "📍 Back Entrance SLIIT",
    "🏫 Computer Laboratory Building SLIIT",
    "🏫 Electronics Laboratory SLIIT",
    "🏫 Workshop Building SLIIT",
    "🏫 Conference Hall SLIIT",
    "🏫 Auditorium SLIIT",
    "🧬 Research Center SLIIT",
    "💼 Business Incubator SLIIT",
    "🏋️ Fitness Center SLIIT",
    "🎾 Tennis Courts SLIIT",
    "🏊 Swimming Pool SLIIT",
    "🎭 Cultural Center SLIIT",  ];

  const stripePromise = useMemo(
    () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY),
    [],
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) {
        setLocalCartItems([]);
        return;
      }
      const parsed = JSON.parse(stored);
      setLocalCartItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setLocalCartItems([]);
    }
  }, []);

  const normalizedCartItems = useMemo(() => {
    const contextItems = Array.isArray(cartContext.cartItems) ? cartContext.cartItems : [];
    const source = contextItems.length > 0 ? contextItems : localCartItems;

    return source.map((item) => ({
      ...item,
      id: item.id || item._id || item.foodID || item.name,
      qty: Number(item.qty || item.quantity || 1),
    }));
  }, [cartContext.cartItems, localCartItems]);

  const backendOrderItems = useMemo(
    () => normalizedCartItems.map((item, index) => {
      const parsedId = Number(item.id);
      return {
        id: Number.isFinite(parsedId) ? parsedId : index + 1,
        name: item.name,
        price: Number(item.price || 0),
        qty: Number(item.qty || 1),
        image: item.image || "",
      };
    }),
    [normalizedCartItems],
  );

  const clearCart = () => {
    if (typeof cartContext.clearCart === "function") {
      cartContext.clearCart();
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    setLocalCartItems([]);
  };

  const savePurchasedItems = () => {
    try {
      const purchasedItems = normalizedCartItems.map(item => ({
        _id: item._id || item.id || item.foodID,
        quantity: item.qty || item.quantity || 1,
      }));
      localStorage.setItem(PURCHASED_ITEMS_KEY, JSON.stringify(purchasedItems));
    } catch (error) {
      console.error("Failed to save purchased items:", error);
    }
  };

  const deliveryFee = normalizedCartItems.length > 0 ? 400 : 0;
  const subTotal = normalizedCartItems.reduce(
    (total, item) => total + (Number(item.price || 0) * Number(item.qty || 0)),
    0,
  );
  const finalTotal = subTotal + deliveryFee;

  const validate = () => {
    const nextErrors = {};
    const fullName = formData.fullName.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const note = formData.note.trim();

    if (!fullName) {
      nextErrors.fullName = "Full name is required.";
    } else if (fullName.length < 3) {
      nextErrors.fullName = "Name must be at least 3 characters.";
    } else if (fullName.length > 60) {
      nextErrors.fullName = "Name must be 60 characters or less.";
    } else if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(fullName)) {
      nextErrors.fullName = "Name can contain letters, spaces, apostrophes, dots, and hyphens only.";
    }

    if (!phone) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phone)) {
      nextErrors.phone = "Phone number must contain exactly 10 digits.";
    }

    if (!address) {
      nextErrors.address = "Delivery address is required.";
    } else if (address.length < 10) {
      nextErrors.address = "Please enter a more detailed address (min. 10 characters).";
    } else if (address.length > 200) {
      nextErrors.address = "Address must be 200 characters or less.";
    }

    if (note.length > 250) {
      nextErrors.note = "Note must be 250 characters or less.";
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "searchLocation") {
      const searchTerm = value.trim().toLowerCase();
      if (searchTerm.length > 0) {
        const filtered = mockLocations.filter((loc) =>
          loc.toLowerCase().includes(searchTerm)
        );
        setLocationSuggestions(filtered);
        setShowLocationDropdown(true);
      } else {
        setLocationSuggestions([]);
        setShowLocationDropdown(false);
      }
    } else {
      setShowLocationDropdown(false);
    }

    if (name === "paymentMethod") {
      setStripeReady(false);
      setClientSecret("");
      setPaymentNotice("");
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, searchLocation: location }));
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  };

  const createOrder = async (paymentMethod, paymentStatus) => {
    const orderData = {
      customer: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        note: formData.note.trim(),
      },
      paymentMethod,
      paymentStatus,
      items: backendOrderItems,
      subTotal,
      deliveryFee,
      total: finalTotal,
    };

    const response = await fetch(apiUrl("/api/orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "Failed to create order.");
    }

    return data.order;
  };

  const handlePlaceOrder = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (normalizedCartItems.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      return;
    }

    setLoading(true);
    try {
      const savedOrder = await createOrder("Cash on Delivery", "Pending");
      savePurchasedItems();
      generateOrderInvoice(savedOrder);
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentIntent = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (normalizedCartItems.length === 0) {
      alert("Your cart is empty. Please add items before paying.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/stripe/create-payment-intent"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountLKR: finalTotal }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStripeReady(true);
        setCardPaymentUnavailable(false);
        return;
      }

      const notConfigured =
        response.status === 503 || /not configured|stripe_secret_key/i.test(String(data?.message || ""));

      if (notConfigured) {
        setCardPaymentUnavailable(true);
        setFormData((prev) => ({ ...prev, paymentMethod: "Cash on Delivery" }));
        setPaymentNotice("Card payment is currently unavailable. Switched to Cash on Delivery.");
        return;
      }

      alert(data?.message || "Failed to start card payment.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while preparing payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardOrderSuccess = async () => {
    try {
      const savedOrder = await createOrder("Card Payment", "Paid");
      savePurchasedItems();
      generateOrderInvoice(savedOrder);
      setSuccess(true);
      clearCart();
      setStripeReady(false);
      setClientSecret("");
    } catch (error) {
      console.error(error);
      alert(error.message || "Payment succeeded, but order saving failed.");
    }
  };

  if (success) {
    return (
      <div className="space-y-3">
        {showUserMenuBar ? (
          isLoggedInCustomer ? (
            <CustomerMenuBar
              onLogout={async () => {
                await clearAuthWithAudit();
                navigate("/login");
              }}
              onProfileClick={() => navigate(getProfilePath(getUser()))}
              cartItemsCount={0}
              onCartClick={() => {}}
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

        <div className="font-sans flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="text-4xl">✅</div>
          <h2 className="text-2xl font-extrabold text-gray-900">Order Placed!</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Your order has been received. We will deliver it shortly.
          </p>
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="rounded-xl bg-green-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showUserMenuBar ? (
        isLoggedInCustomer ? (
          <CustomerMenuBar
            onLogout={async () => {
              await clearAuthWithAudit();
              navigate("/login");
            }}
            onProfileClick={() => navigate(getProfilePath(getUser()))}
            cartItemsCount={normalizedCartItems.reduce((sum, item) => sum + Number(item.qty || 0), 0)}
            onCartClick={() => {}}
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

      <div className="font-sans overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="flex items-center gap-4 bg-green-600 px-6 py-5">
        <button
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white"
        >
          ←
        </button>
        <h2 className="text-xl font-extrabold text-white">Checkout</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  maxLength={60}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">Search Location</label>
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="searchLocation"
                    value={formData.searchLocation}
                    onChange={handleChange}
                    onFocus={() => formData.searchLocation.length > 0 && setShowLocationDropdown(true)}
                    placeholder="Search location (optional)"
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-xl">
                    {locationSuggestions.map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-800 transition hover:bg-blue-50 last:border-b-0"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                        <span>{location}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-gray-500">💳 Payment Method</h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                {["Cash on Delivery", "Card Payment"].map((method) => {
                  const isCardMethod = method === "Card Payment";
                  const isDisabled = isCardMethod && cardPaymentUnavailable;

                  return (
                    <label
                      key={method}
                      className={`flex flex-1 items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                        isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                      } ${
                        formData.paymentMethod === method
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-gray-50 hover:border-green-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={handleChange}
                        disabled={isDisabled}
                        className="accent-green-600"
                      />
                      <span className="text-sm font-semibold text-gray-800">
                        {method === "Cash on Delivery" ? "💵 " : "💳 "}
                        {method}
                      </span>
                    </label>
                  );
                })}
              </div>
              {paymentNotice && (
                <p className="mt-2 text-xs font-semibold text-amber-700">{paymentNotice}</p>
              )}
              {cardPaymentUnavailable && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                  Card payment is temporarily unavailable. Use Cash on Delivery.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">Note (Optional)</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={3}
                maxLength={250}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              />
              {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note}</p>}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-5 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-gray-500">🧾 Order Summary</h3>

              <div className="mb-4 space-y-2">
                {normalizedCartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.qty}</span>
                    <span className="font-semibold text-gray-800">
                      Rs. {(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs. {subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1 text-base font-extrabold text-gray-900">
                  <span>Total</span>
                  <span className="text-green-700">Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {formData.paymentMethod === "Cash on Delivery" ? (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className={`mt-5 w-full rounded-xl py-3.5 text-sm font-extrabold text-white ${
                    loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {loading ? "Placing Order..." : "Place Order 🎉"}
                </button>
              ) : !stripeReady ? (
                <button
                  onClick={handleCreatePaymentIntent}
                  disabled={loading}
                  className={`mt-5 w-full rounded-xl py-3.5 text-sm font-extrabold text-white ${
                    loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {loading ? "Preparing Payment..." : "Continue to Card Payment 💳"}
                </button>
              ) : (
                <div className="mt-5">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm onPaymentSuccess={handleCardOrderSuccess} />
                  </Elements>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Checkout;

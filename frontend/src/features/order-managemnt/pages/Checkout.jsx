import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  Search, MapPin, ChevronLeft, CheckCircle, ShoppingBag,
  Truck, CreditCard, Banknote, User, Phone, FileText, StickyNote
} from "lucide-react";
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .co-root * { box-sizing: border-box; }
  .co-root {
    font-family: 'DM Sans', sans-serif;
    background: #f0f7f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .co-header {
    background: linear-gradient(135deg, #239e54 0%, #1e914a 50%, #15803d 100%);
    position: relative;
    box-shadow: 0 4px 24px rgba(20,83,45,0.25);
    flex-shrink: 0;
  }
  .co-header-inner {
    max-width: none; margin: 0;
    padding: 12px 16px;
    display: flex; align-items: center; gap: 16px;
  }
  .co-back-btn {
    width: 40px; height: 40px; border-radius: 12px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; flex-shrink: 0;
  }
  .co-back-btn:hover { background: rgba(255,255,255,0.25); }
  .co-header-title {
    font-family: 'Sora', sans-serif;
    font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.3px;
  }
  .co-header-badge {
    margin-left: auto;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px; padding: 4px 14px;
    font-size: 13px; color: rgba(255,255,255,0.85); white-space: nowrap;
  }

  /* ── Steps ── */
  .co-steps {
    background: #fff; border-bottom: 1px solid #dcfce7; padding: 6px 16px;
    flex-shrink: 0;
  }
  .co-steps-inner {
    max-width: none; margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  .co-step { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #86efac; }
  .co-step.active { color: #16a34a; }
  .co-step.done { color: #16a34a; }
  .co-step-dot {
    width: 20px; height: 20px; border-radius: 50%;
    background: #dcfce7;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #86efac;
  }
  .co-step.active .co-step-dot { background: #16a34a; color: #fff; }
  .co-step.done .co-step-dot { background: #dcfce7; color: #16a34a; }
  .co-step-line { flex: 1; height: 1px; background: #dcfce7; max-width: 44px; }

  /* ── Layout ── */
  .co-main {
    max-width: none; margin: 0;
    flex: 1;
    min-height: 0;
    padding: 8px 12px 12px;
    display: grid; grid-template-columns: minmax(0, 1fr) 360px;
    gap: 8px; align-items: start;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .co-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 8px;
    min-height: auto;
  }
  .co-form-grid .co-card {
    margin-bottom: 0;
    display: block;
    width: 100%;
    justify-self: stretch;
  }
  .co-form-grid .co-card-body {
    padding: 0 12px 10px;
    overflow: visible;
  }
  @media (max-width: 900px) {
    .co-root { height: auto; min-height: 100vh; overflow: auto; }
    .co-main { height: auto; overflow: visible; grid-template-columns: 1fr; padding: 20px 16px 48px; }
    .co-form-grid { grid-template-columns: 1fr; }
    .co-header-inner { padding: 16px 20px; }
    .co-steps { padding: 10px 20px; }
  }

  /* ── Cards ── */
  .co-card {
    background: #fff; border-radius: 12px;
    border: 1px solid #dcfce7; overflow: hidden; margin-bottom: 16px;
  }
  .co-card-header {
    padding: 10px 12px 0;
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  }
  .co-card-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: #dcfce7; display: flex; align-items: center; justify-content: center;
    color: #16a34a; flex-shrink: 0;
  }
  .co-card-title { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #14532d; }
  .co-card-body { padding: 0 12px 10px; }

  /* ── Fields ── */
  .co-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  @media (max-width: 600px) { .co-field-grid { grid-template-columns: 1fr; } }
  .co-field { display: flex; flex-direction: column; gap: 6px; }
  .co-label {
    font-size: 12px; font-weight: 600; color: #28b35e;
    text-transform: uppercase; letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 5px;
  }
  .co-label svg { width: 13px; height: 13px; color: #4ade80; }
  .co-input {
    width: 100%; padding: 8px 10px;
    border-radius: 12px; border: 1.5px solid #dcfce7;
    background: #f0fdf4; font-size: 12px; color: #14532d;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .co-input:focus {
    border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.15); background: #fff;
  }
  .co-input.error { border-color: #fca5a5; background: #fef2f2; }
  .co-textarea { resize: none; min-height: 52px; }
  .co-error { font-size: 11px; color: #ef4444; font-weight: 500; }

  /* ── Location ── */
  .co-location-wrap { position: relative; }
  .co-location-input-wrap { position: relative; display: flex; align-items: center; }
  .co-location-icon { position: absolute; left: 14px; color: #4ade80; width: 16px; height: 16px; }
  .co-location-input {
    width: 100%; padding: 8px 10px 8px 32px;
    border-radius: 12px; border: 1.5px solid #dcfce7;
    background: #f0fdf4; font-size: 12px; color: #14532d;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .co-location-input:focus {
    border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.15); background: #fff;
  }
  .co-location-dropdown {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 200;
    background: #fff; border-radius: 14px; border: 1px solid #dcfce7;
    box-shadow: 0 12px 40px rgba(20,83,45,0.12);
    max-height: 240px; overflow-y: auto; padding: 6px;
  }
  .co-location-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 10px; cursor: pointer; font-size: 13px; color: #166534;
    transition: background 0.15s; width: 100%; background: none; border: none; text-align: left;
  }
  .co-location-item:hover { background: #f0fdf4; }
  .co-location-item svg { color: #4ade80; flex-shrink: 0; }

  /* ── Payment ── */
  .co-payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 600px) { .co-payment-grid { grid-template-columns: 1fr; } }
  .co-payment-option { position: relative; cursor: pointer; }
  .co-payment-option input[type="radio"] { display: none; }
  .co-payment-label {
    display: flex; align-items: center; gap: 10px; padding: 12px 12px;
    border-radius: 14px; border: 2px solid #dcfce7; background: #f9fef9;
    transition: all 0.2s; cursor: pointer;
  }
  .co-payment-option input:checked + .co-payment-label {
    border-color: #16a34a; background: #f0fdf4;
    box-shadow: 0 0 0 3px rgba(22,163,74,0.1);
  }
  .co-payment-icon {
    width: 32px; height: 32px; border-radius: 10px; background: #dcfce7;
    display: flex; align-items: center; justify-content: center;
    color: #16a34a; transition: background 0.2s; flex-shrink: 0;
  }
  .co-payment-option input:checked + .co-payment-label .co-payment-icon {
    background: #16a34a; color: #fff;
  }
  .co-payment-option.disabled .co-payment-label { opacity: 0.45; cursor: not-allowed; }
  .co-payment-text { display: flex; flex-direction: column; }
  .co-payment-name { font-size: 13px; font-weight: 600; color: #14532d; }
  .co-payment-desc { font-size: 11px; color: #4ade80; margin-top: 1px; }
  .co-radio-check {
    width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1fae5;
    margin-left: auto; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s; position: relative;
  }
  .co-payment-option input:checked + .co-payment-label .co-radio-check {
    border-color: #16a34a; background: #16a34a;
  }
  .co-radio-inner {
    width: 7px; height: 7px; border-radius: 50%; background: #fff; opacity: 0; transition: opacity 0.2s;
  }
  .co-payment-option input:checked + .co-payment-label .co-radio-check .co-radio-inner { opacity: 1; }

  /* ── Sidebar / Summary ── */
  .co-sidebar { min-height: auto; }
  .co-summary-card {
    background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 20px; overflow: hidden; color: #14532d;
    height: auto; display: flex; flex-direction: column;
  }
  .co-summary-header {
    padding: 14px 16px 10px; border-bottom: 1px solid #bbf7d0;
    display: flex; align-items: center; gap: 10px;
  }
  .co-summary-header-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #dcfce7;
    display: flex; align-items: center; justify-content: center;
    color: #15803d;
  }
  .co-summary-title { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; color: #14532d; }
  .co-summary-body { padding: 12px 16px; overflow: visible; min-height: auto; }
  .co-item-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 8px; padding: 10px 0; border-bottom: 1px solid #d1fae5;
    font-size: 13px;
  }
  .co-item-row:last-child { border-bottom: none; }
  .co-item-name { color: #166534; flex: 1; line-height: 1.4; }
  .co-item-qty {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 6px;
    background: #bbf7d0; color: #166534;
    font-size: 11px; font-weight: 700; flex-shrink: 0; margin-right: 6px;
  }
  .co-item-price { color: #14532d; font-weight: 600; flex-shrink: 0; }
  .co-summary-totals { padding: 12px 16px; background: #dcfce7; }
  .co-total-row {
    display: flex; justify-content: space-between;
    font-size: 13px; color: #166534; padding: 5px 0;
  }
  .co-total-row.final {
    font-size: 18px; font-weight: 700; color: #14532d;
    padding-top: 12px; margin-top: 8px; border-top: 1px solid #86efac;
  }
  .co-total-row.final span:last-child { color: #15803d; }

  /* ── CTA ── */
  .co-cta {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: calc(100% - 32px); margin: 12px 16px 16px;
    padding: 12px; border-radius: 12px;
    background: linear-gradient(135deg, #2a874c, #29874b);
    color: #fff; font-family: 'Sora', sans-serif;
    font-size: 15px; font-weight: 700;
    border: none; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(22,163,74,0.35);
  }
  .co-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(22,163,74,0.45); }
  .co-cta:active { transform: translateY(0); }
  .co-cta:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .co-stripe-wrap { padding: 0 16px 16px; }

  /* ── Notice ── */
  .co-notice {
    display: flex; align-items: flex-start; gap: 8px;
    background: #fffbeb; border: 1px solid #fde68a;
    border-radius: 10px; padding: 10px 14px;
    font-size: 12px; font-weight: 500; color: #92400e; margin-bottom: 14px;
  }

  /* ── Delivery badge ── */
  .co-delivery-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #dcfce7; border-radius: 8px; padding: 5px 10px;
    font-size: 12px; font-weight: 600; color: #28b85d; margin-bottom: 16px;
  }

  /* ── Success ── */
  .co-success-wrap {
    display: flex; align-items: center; justify-content: center;
    min-height: 70vh; padding: 32px 16px;
  }
  .co-success {
    max-width: 480px; width: 100%;
    background: #fff; border-radius: 28px; padding: 48px 40px;
    text-align: center; border: 1px solid #dcfce7;
    box-shadow: 0 20px 60px rgba(20,83,45,0.1);
  }
  .co-success-ring {
    width: 88px; height: 88px; border-radius: 50%;
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px; color: #16a34a;
  }
  .co-success-title {
    font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800;
    color: #26b15d; margin-bottom: 10px;
  }
  .co-success-text { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 28px; }
  .co-success-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px;
    background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff;
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700;
    border: none; border-radius: 14px; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(22,163,74,0.35);
  }
  .co-success-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(22,163,74,0.4); }

  /* ── Spinner ── */
  @keyframes co-spin { to { transform: rotate(360deg); } }
  .co-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
    animation: co-spin 0.7s linear infinite; display: inline-block;
  }
`;

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
  "🛏️ SLIIT Hostel 3 Malabe",
  "🛏️ SLIIT Hostel 4 Malabe",
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
  "🏘️ Colombo District",
  "🏘️ Kandy District",
  "📫 Malabe Post Office",
  "🏥 General Hospital Colombo",
  "🚌 Malabe Bus Station",
  "🚌 Colombo Fort Railway Station",
  "🏘️ Maharagama",
  "🏘️ Nugegoda",
  "🏘️ Colombo 7",
  "🏘️ Colombo 5",
  "🏘️ Colombo 3",
  "🏘️ Colombo 1",
  "🏘️ Galle Road",
  "🏘️ Dehiwala",
  "🏘️ Mount Lavinia",
  "🏘️ Moratuwa",
  "🏘️ Kandy City",
  "🏘️ Anuradhapura",
  "🏘️ Jaffna",
  "📍 Gate A SLIIT",
  "📍 Gate B SLIIT",
  "📍 Main Entrance SLIIT",
  "🏫 Computer Laboratory Building SLIIT",
  "🏫 Auditorium SLIIT",
  "🧬 Research Center SLIIT",
  "🎭 Cultural Center SLIIT",
];

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

  const stripePromise = useMemo(() => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY), []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) { setLocalCartItems([]); return; }
      const parsed = JSON.parse(stored);
      setLocalCartItems(Array.isArray(parsed) ? parsed : []);
    } catch { setLocalCartItems([]); }
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
    if (typeof cartContext.clearCart === "function") cartContext.clearCart();
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
    } catch (error) { console.error("Failed to save purchased items:", error); }
  };

  const deliveryFee = normalizedCartItems.length > 0 ? 200 : 0;
  const subTotal = normalizedCartItems.reduce(
    (total, item) => total + (Number(item.price || 0) * Number(item.qty || 0)), 0,
  );
  const finalTotal = subTotal + deliveryFee;

  const validate = () => {
    const nextErrors = {};
    const fullName = formData.fullName.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const note = formData.note.trim();

    if (!fullName) nextErrors.fullName = "Full name is required.";
    else if (fullName.length < 3) nextErrors.fullName = "Name must be at least 3 characters.";
    else if (fullName.length > 60) nextErrors.fullName = "Name must be 60 characters or less.";
    else if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(fullName)) nextErrors.fullName = "Letters, spaces, apostrophes, dots, and hyphens only.";

    if (!phone) nextErrors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(phone)) nextErrors.phone = "Must be exactly 10 digits.";

    if (!address) nextErrors.address = "Delivery address is required.";
    else if (address.length < 10) nextErrors.address = "Please enter a more detailed address (min. 10 characters).";
    else if (address.length > 200) nextErrors.address = "Address must be 200 characters or less.";

    if (note.length > 250) nextErrors.note = "Note must be 250 characters or less.";

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 10);

    if (name === "searchLocation") {
      const searchTerm = value.trim().toLowerCase();
      if (searchTerm.length > 0) {
        setLocationSuggestions(mockLocations.filter(loc => loc.toLowerCase().includes(searchTerm)));
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

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
      paymentMethod, paymentStatus,
      items: backendOrderItems, subTotal, deliveryFee, total: finalTotal,
    };
    const response = await fetch(apiUrl("/api/orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.message || "Failed to create order.");
    return data.order;
  };

  const handlePlaceOrder = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    if (normalizedCartItems.length === 0) { alert("Your cart is empty."); return; }
    setLoading(true);
    try {
      const savedOrder = await createOrder("Cash on Delivery", "Pending");
      savePurchasedItems();
      generateOrderInvoice(savedOrder);
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleCreatePaymentIntent = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    if (normalizedCartItems.length === 0) { alert("Your cart is empty."); return; }
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
      const notConfigured = response.status === 503 || /not configured|stripe_secret_key/i.test(String(data?.message || ""));
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
    } finally { setLoading(false); }
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

  const menuBarLogout = async () => { await clearAuthWithAudit(); navigate("/login"); };
  const menuBarProfile = () => navigate(getProfilePath(getUser()));
  const cartCount = normalizedCartItems.reduce((s, i) => s + Number(i.qty || 0), 0);

  const MenuBar = showUserMenuBar
    ? isLoggedInCustomer
      ? <CustomerMenuBar onLogout={menuBarLogout} onProfileClick={menuBarProfile} cartItemsCount={cartCount} onCartClick={() => {}} />
      : <UserMenuBar onLogout={menuBarLogout} onProfileClick={menuBarProfile} />
    : null;

  // ── Success screen ──
  if (success) {
    return (
      <div className="co-root">
        <style>{styles}</style>
        {MenuBar}
        <div className="co-success-wrap">
          <div className="co-success">
            <div className="co-success-ring">
              <CheckCircle size={44} strokeWidth={1.5} />
            </div>
            <div className="co-success-title">Order Confirmed!</div>
            <p className="co-success-text">
              Your order has been placed successfully. We're preparing your food and will deliver it to you shortly. Check your invoice for order details.
            </p>
            <button className="co-success-btn" onClick={() => (onBack ? onBack() : window.history.back())}>
              <ShoppingBag size={16} />
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout ──
  return (
    <div className="co-root">
      <style>{styles}</style>
      {MenuBar}

      {/* Header */}
      <div className="co-header">
        <div className="co-header-inner">
          <button className="co-back-btn" onClick={() => (onBack ? onBack() : window.history.back())}>
            <ChevronLeft size={20} />
          </button>
          <span className="co-header-title">Checkout</span>
          <span className="co-header-badge">
            {normalizedCartItems.length} item{normalizedCartItems.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="co-steps">
        <div className="co-steps-inner">
          <div className="co-step done">
            <div className="co-step-dot">✓</div>
            <span>Cart</span>
          </div>
          <div className="co-step-line" />
          <div className="co-step active">
            <div className="co-step-dot">2</div>
            <span>Details</span>
          </div>
          <div className="co-step-line" />
          <div className="co-step">
            <div className="co-step-dot">3</div>
            <span>Confirm</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="co-main">

        {/* ── Left column ── */}
        <div className="co-form-grid">

          {/* Contact info */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-icon"><User size={18} /></div>
              <div className="co-card-title">Contact Information</div>
            </div>
            <div className="co-card-body">
              <div className="co-field-grid">
                <div className="co-field">
                  <label className="co-label"><User size={12} />Full Name *</label>
                  <input
                    type="text" name="fullName" value={formData.fullName}
                    onChange={handleChange} maxLength={60} placeholder="Enter your full name"
                    className={`co-input${errors.fullName ? " error" : ""}`}
                  />
                  {errors.fullName && <span className="co-error">{errors.fullName}</span>}
                </div>
                <div className="co-field">
                  <label className="co-label"><Phone size={12} />Phone Number *</label>
                  <input
                    type="tel" name="phone" value={formData.phone}
                    onChange={handleChange} inputMode="numeric" pattern="[0-9]{10}" maxLength={10}
                    placeholder="0771234567"
                    className={`co-input${errors.phone ? " error" : ""}`}
                  />
                  {errors.phone && <span className="co-error">{errors.phone}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-icon"><MapPin size={18} /></div>
              <div className="co-card-title">Delivery Address</div>
            </div>
            <div className="co-card-body">
              <div className="co-delivery-badge"><Truck size={12} />Estimated delivery: 30–45 mins</div>

              <div className="co-field" style={{ marginBottom: 14 }}>
                <label className="co-label"><Search size={12} />Quick Location Search</label>
                <div className="co-location-wrap">
                  <div className="co-location-input-wrap">
                    <Search className="co-location-icon" />
                    <input
                      type="text" name="searchLocation" value={formData.searchLocation}
                      onChange={handleChange}
                      onFocus={() => formData.searchLocation.length > 0 && setShowLocationDropdown(true)}
                      placeholder="Search campus buildings, roads…"
                      className="co-location-input"
                    />
                  </div>
                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div className="co-location-dropdown">
                      {locationSuggestions.map((loc, i) => (
                        <button key={i} type="button" onClick={() => handleLocationSelect(loc)} className="co-location-item">
                          <MapPin size={13} />{loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="co-field">
                <label className="co-label"><FileText size={12} />Full Address *</label>
                <textarea
                  name="address" value={formData.address} onChange={handleChange}
                  rows={3} maxLength={200} placeholder="Enter your complete delivery address…"
                  className={`co-input co-textarea${errors.address ? " error" : ""}`}
                />
                {errors.address && <span className="co-error">{errors.address}</span>}
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-icon"><CreditCard size={18} /></div>
              <div className="co-card-title">Payment Method</div>
            </div>
            <div className="co-card-body">
              {paymentNotice && (
                <div className="co-notice"><span>⚠️</span>{paymentNotice}</div>
              )}
              <div className="co-payment-grid">
                {[
                  { value: "Cash on Delivery", icon: <Banknote size={18} />, name: "Cash on Delivery", desc: "Pay when delivered", disabled: false },
                  { value: "Card Payment", icon: <CreditCard size={18} />, name: "Card Payment", desc: "Secure online payment", disabled: cardPaymentUnavailable },
                ].map((opt) => (
                  <label key={opt.value} className={`co-payment-option${opt.disabled ? " disabled" : ""}`}>
                    <input
                      type="radio" name="paymentMethod" value={opt.value}
                      checked={formData.paymentMethod === opt.value}
                      onChange={handleChange} disabled={opt.disabled}
                    />
                    <div className="co-payment-label">
                      <div className="co-payment-icon">{opt.icon}</div>
                      <div className="co-payment-text">
                        <span className="co-payment-name">{opt.name}</span>
                        <span className="co-payment-desc">{opt.desc}</span>
                      </div>
                      <div className="co-radio-check"><div className="co-radio-inner" /></div>
                    </div>
                  </label>
                ))}
              </div>
              {cardPaymentUnavailable && (
                <div className="co-notice" style={{ marginTop: 12, marginBottom: 0 }}>
                  <span>⚠️</span>Card payment is temporarily unavailable. Please use Cash on Delivery.
                </div>
              )}
            </div>
          </div>

          {/* Special instructions */}
          <div className="co-card">
            <div className="co-card-header">
              <div className="co-card-icon"><StickyNote size={18} /></div>
              <div className="co-card-title">Special Instructions</div>
            </div>
            <div className="co-card-body">
              <div className="co-field">
                <label className="co-label"><StickyNote size={12} />Note for delivery (optional)</label>
                <textarea
                  name="note" value={formData.note} onChange={handleChange}
                  rows={3} maxLength={250}
                  placeholder="Any special requests, allergies, or delivery instructions…"
                  className={`co-input co-textarea${errors.note ? " error" : ""}`}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {errors.note ? <span className="co-error">{errors.note}</span> : <span />}
                  <span style={{ fontSize: 11, color: "#4ade80" }}>{formData.note.length}/250</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="co-sidebar">
          <div className="co-summary-card">
            <div className="co-summary-header">
              <div className="co-summary-header-icon"><ShoppingBag size={18} /></div>
              <div className="co-summary-title">Order Summary</div>
            </div>

            <div className="co-summary-body">
              {normalizedCartItems.length === 0 ? (
                <div style={{ color: "#166534", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                  Your cart is empty
                </div>
              ) : normalizedCartItems.map((item) => (
                <div key={item.id} className="co-item-row">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: 1 }}>
                    <span className="co-item-qty">{item.qty}</span>
                    <span className="co-item-name">{item.name}</span>
                  </div>
                  <span className="co-item-price">
                    Rs. {(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="co-summary-totals">
              <div className="co-total-row">
                <span>Subtotal</span>
                <span>Rs. {subTotal.toLocaleString()}</span>
              </div>
              <div className="co-total-row">
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Truck size={13} />Delivery Fee
                </span>
                <span>Rs. {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="co-total-row final">
                <span>Total</span>
                <span>Rs. {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {formData.paymentMethod === "Cash on Delivery" ? (
              <button className="co-cta" onClick={handlePlaceOrder} disabled={loading}>
                {loading
                  ? <><span className="co-spinner" />Placing Order…</>
                  : <><CheckCircle size={17} />Place Order</>}
              </button>
            ) : !stripeReady ? (
              <button className="co-cta" onClick={handleCreatePaymentIntent} disabled={loading}>
                {loading
                  ? <><span className="co-spinner" />Preparing…</>
                  : <><CreditCard size={17} />Continue to Payment</>}
              </button>
            ) : (
              <div className="co-stripe-wrap">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm onPaymentSuccess={handleCardOrderSuccess} />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

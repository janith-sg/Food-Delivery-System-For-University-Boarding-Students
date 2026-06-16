import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import GroupStripePaymentForm from "./GroupStripePaymentForm";
import generateGroupOrderInvoice from "../utils/generateGroupOrderInvoice";
import CustomerMenuBar from "../../user-management/components/CustomerMenuBar";
import { clearAuthWithAudit, getUser } from "../../../lib/auth";
import { getProfilePath } from "../../../lib/postLoginRedirect";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const GroupSummary = ({ groupCode, memberName, onBack }) => {
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
const [stripeReady, setStripeReady] = useState(false);

  const fetchGroup = async () => {
    setFetching(true);
    try {
      const res = await fetch(apiUrl(`/api/group-orders/${groupCode}`));
      const data = await res.json();
      if (res.ok) {
        setGroupData(data);
        if (data.paymentMethod) setPaymentMethod(data.paymentMethod);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (groupCode) fetchGroup();
  }, [groupCode]);

  const getSubTotal = () =>
    groupData?.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;

  const deliveryFee = groupData?.deliveryFee || 200;
  const subTotal = getSubTotal();
  const finalTotal = groupData?.finalTotal || subTotal + deliveryFee;

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
  const isLeader = groupData?.createdBy === memberName;
  const isCompleted = groupData?.status === "Completed";

  // Payment is locked if the user is not the leader OR the order is completed
  const paymentLocked = !isLeader || isCompleted;

  const finalizeGroupOrder = async () => {
    if (!groupData?.items?.length) {
      alert("Please add items before completing the group order.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/group-orders/finalize"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode, paymentMethod }),
      });
      const data = await response.json();
      if (response.ok) {
  const updatedGroup = data.group;

  generateGroupOrderInvoice(updatedGroup);

  setLoading(false);
  fetchGroup();
} else {
        alert(data.message || "Failed to finalize group order.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const gsStyles = `
    @keyframes gs-spin { to { transform: rotate(360deg); } }
    .gs-page {
      min-height: 100vh;
      padding: 18px 16px 32px;
      background:
        radial-gradient(circle at top left, rgba(34,197,94,0.12), transparent 30%),
        radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent 28%),
        #f0fdf4;
    }
    .gs-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .gs-header {
      border-radius: 24px;
      background: linear-gradient(135deg, #14532d 0%, #16a34a 52%, #22c55e 100%);
      padding: 22px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 18px 42px rgba(20,83,45,0.18);
      border: 1px solid rgba(255,255,255,0.12);
      color: #fff;
    }
    .gs-header-content h1 {
      font-size: 28px;
      font-weight: 900;
      margin: 0 0 10px;
      letter-spacing: -0.02em;
    }
    .gs-header-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .gs-badge, .gs-status-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 999px;
    }
    .gs-badge {
      background: rgba(255,255,255,0.14);
      color: #fff;
      font-family: monospace;
      letter-spacing: 0.15em;
    }
    .gs-status-badge {
      background: #dcfce7;
      color: #166534;
    }
    .gs-status-badge.completed { background: #86efac; color: #15803d; }
    .gs-back-btn {
      width: 44px;
      height: 44px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.22);
      background: rgba(255,255,255,0.12);
      color: #fff;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.18s ease, background 0.18s ease;
      flex-shrink: 0;
    }
    .gs-back-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.2); }
    .gs-banner {
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
    }
    .gs-banner-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .gs-card {
      border-radius: 20px;
      background: #fff;
      border: 1px solid #d1fae5;
      box-shadow: 0 12px 40px rgba(20,83,45,0.08);
      overflow: hidden;
    }
    .gs-card-header {
      background: #f0fdf4;
      border-bottom: 1px solid #d1fae5;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .gs-card-title {
      font-size: 12px;
      font-weight: 800;
      color: #14532d;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0;
    }
    .gs-card-body { padding: 18px; }
    .gs-item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #f9fdf8;
      border-radius: 14px;
      padding: 12px 14px;
      border: 1px solid #d1fae5;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .gs-item-name { font-weight: 700; color: #14532d; }
    .gs-item-meta { font-size: 12px; color: #6b7280; margin-top: 3px; }
    .gs-item-price { font-weight: 800; color: #15803d; }
    .gs-totals-panel {
      border-radius: 14px;
      background: #ecfdf5;
      border: 1px solid #bbf7d0;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .gs-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #4b5563;
    }
    .gs-total-row.final {
      border-top: 1px solid #bbf7d0;
      padding-top: 10px;
      margin-top: 6px;
      font-size: 16px;
      font-weight: 800;
      color: #14532d;
    }
    .gs-total-row.final span:last-child { color: #15803d; }
    .gs-member-split {
      border-radius: 12px;
      border: 1px solid #d1fae5;
      padding: 12px 14px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .gs-member-name { font-weight: 700; color: #14532d; font-size: 14px; margin: 0; }
    .gs-member-detail { font-size: 12px; color: #6b7280; margin: 3px 0 0; }
    .gs-member-total { font-weight: 800; color: #15803d; font-size: 16px; }
    .gs-payment-option {
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 14px;
      border: 2px solid #d1fae5;
      background: #f9fdf8;
      padding: 14px 16px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gs-payment-option.active {
      border-color: #16a34a;
      background: #ecfdf5;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
    }
    .gs-payment-label { font-weight: 700; color: #14532d; font-size: 14px; }
    .gs-action-btn {
      width: 100%;
      border-radius: 14px;
      padding: 14px 16px;
      border: none;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 10px 28px rgba(22,163,74,0.16);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      color: #fff;
    }
    .gs-action-btn:hover:not(:disabled) { transform: translateY(-1px); }
    .gs-action-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .gs-info-box {
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
    }
    .gs-info-lock { background: #fffbeb; border: 1px solid #fde68a; color: #b45309; }
    .gs-info-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
    .gs-grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
    @media (min-width: 900px) {
      .gs-grid { grid-template-columns: 2fr 1fr; }
    }
  `;

  const handleCreateGroupPaymentIntent = async () => {
  if (!groupData?.items?.length) {
    alert("Please add items before paying.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(apiUrl("/api/stripe/create-payment-intent"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountLKR: finalTotal,
      }),
    });

    const data = await response.json();

    if (response.ok && data.clientSecret) {
      setClientSecret(data.clientSecret);
      setStripeReady(true);
    } else {
      alert(data.message || "Failed to start group card payment.");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong while preparing group payment.");
  } finally {
    setLoading(false);
  }
};


const handleGroupCardPaymentSuccess = async () => {
  setLoading(true);
  try {
    const response = await fetch(apiUrl("/api/group-orders/finalize"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupCode,
        paymentMethod: "Card Payment",
      }),
    });

    const data = await response.json();

   if (response.ok) {
  const updatedGroup = data.group;

  generateGroupOrderInvoice(updatedGroup);

  setStripeReady(false);
  setClientSecret("");
  fetchGroup();
} else {
      alert(data.message || "Payment succeeded, but group order finalization failed.");
    }
  } catch (error) {
    console.error(error);
    alert("Payment succeeded, but something went wrong while finalizing the group order.");
  } finally {
    setLoading(false);
  }
};

  if (fetching) {
    return (
      <>
        <style>{gsStyles}</style>
        <CustomerMenuBar
          onLogout={async () => {
            await clearAuthWithAudit();
            navigate("/login");
          }}
          onProfileClick={() => navigate(getProfilePath(getUser()))}
          cartItemsCount={0}
          onCartClick={() => navigate("/checkout")}
        />
        <div className="gs-page font-sans">
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>
            <svg style={{ animation: "gs-spin 1s linear infinite", height: 36, width: 36, color: "#22c55e" }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{gsStyles}</style>
      <CustomerMenuBar
        onLogout={async () => {
          await clearAuthWithAudit();
          navigate("/login");
        }}
        onProfileClick={() => navigate(getProfilePath(getUser()))}
        cartItemsCount={0}
        onCartClick={() => navigate("/checkout")}
      />
      
      {/* Completion Success Screen */}
      {isCompleted && (
        <div className="gs-page font-sans" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            background: "#fff",
            borderRadius: 28,
            padding: "48px 40px",
            maxWidth: 520,
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(20,83,45,0.15)",
            border: "1px solid #d1fae5",
          }}>
            {/* Success Icon */}
            <div style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              border: "3px solid #86efac",
            }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#14532d",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}>
              Group Order Completed!
            </h1>

            <p style={{
              fontSize: 16,
              color: "#6b7280",
              margin: "0 0 28px",
              lineHeight: 1.6,
            }}>
              Your group order has been placed successfully. We're preparing your food and will deliver it shortly. Check your invoice for order details.
            </p>

            {/* Group Details Card */}
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 16,
              padding: "16px",
              marginBottom: 28,
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#14532d", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
                    Group Code
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: "#15803d", fontFamily: "monospace", margin: 0, letterSpacing: "0.15em" }}>
                    {groupCode}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#14532d", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
                    Payment Method
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#15803d", margin: 0 }}>
                    {groupData?.paymentMethod || paymentMethod}
                  </p>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #bbf7d0", marginTop: 12, paddingTop: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#14532d", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Total Amount
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: "#15803d", margin: 0 }}>
                  Rs. {finalTotal.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate("/menu#all-products")}
              style={{
                width: "100%",
                borderRadius: 16,
                padding: "16px",
                border: "none",
                fontSize: 16,
                fontWeight: 800,
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 10px 28px rgba(22,163,74,0.2)",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 14px 36px rgba(22,163,74,0.28)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 10px 28px rgba(22,163,74,0.2)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Back to Our Menu
            </button>
          </div>
        </div>
      )}

      {/* Order Summary View (when not completed) */}
      {!isCompleted && (
      <div className="gs-page font-sans">
        <div className="gs-container">

          {/* Header */}
          <div className="gs-header">
            <div className="gs-header-content">
              <h1>Order Summary 🧾</h1>
              <div className="gs-header-badges">
                <span className="gs-badge">
                  {groupCode}
                </span>
                <span className={`gs-status-badge ${isCompleted ? "completed" : ""}`}>
                  {groupData?.status || "Loading..."}
                </span>
              </div>
            </div>
            <button onClick={onBack} className="gs-back-btn">←</button>
          </div>

          {/* Two column grid */}
          <div className="gs-grid">

            {/* Items card */}
            <div className="gs-card">
              <div className="gs-card-header">
                <h2 className="gs-card-title">📋 Shared Items</h2>
              </div>
              <div className="gs-card-body">
                {!groupData?.items?.length ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🍽️</div>
                    <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>No items added yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {groupData.items.map((item, index) => (
                      <div key={index} className="gs-item-row">
                        <div>
                          <p className="gs-item-name" style={{ margin: 0 }}>{item.name}</p>
                          <p className="gs-item-meta">Added by {item.addedBy}</p>
                          <p className="gs-item-meta">Rs. {item.price.toLocaleString()} × {item.qty}</p>
                        </div>
                        <span className="gs-item-price">
                          Rs. {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="gs-totals-panel">
                      <div className="gs-total-row">
                        <span>Subtotal</span><span style={{ fontWeight: 600 }}>Rs. {subTotal.toLocaleString()}</span>
                      </div>
                      <div className="gs-total-row">
                        <span>Delivery Fee</span><span style={{ fontWeight: 600 }}>Rs. {deliveryFee.toLocaleString()}</span>
                      </div>
                      <div className="gs-total-row final">
                        <span>Final Total</span>
                        <span>Rs. {finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Bill split */}
              <div className="gs-card">
                <div className="gs-card-header">
                  <h2 className="gs-card-title">💰 Bill Split</h2>
                </div>
                <div className="gs-card-body">
                  {splitData.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>No split data yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {splitData.map((member, index) => (
                        <div key={index} className="gs-member-split">
                          <div>
                            <p className="gs-member-name">{member.name}</p>
                            <p className="gs-member-detail">
                              Food Rs. {member.subTotal.toLocaleString()} + Delivery Rs. {member.delivery.toFixed(0)}
                            </p>
                          </div>
                          <span className="gs-member-total">Rs. {member.total.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div className="gs-card">
                <div className="gs-card-header" style={{ justifyContent: "space-between" }}>
                  <h2 className="gs-card-title">💳 Payment Method</h2>
                  {/* Lock badge shown to non-leaders */}
                  {!isLeader && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 999 }}>
                      🔒 Leader only
                    </span>
                  )}
                </div>
                <div className="gs-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {["Cash on Delivery", "Card Payment"].map((method) => (
                    <label key={method} className={`gs-payment-option ${paymentMethod === method ? "active" : ""}`} style={{
                      cursor: paymentLocked ? "not-allowed" : "pointer",
                      opacity: paymentLocked ? 0.55 : 1,
                    }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => {
  setPaymentMethod(e.target.value);
  setStripeReady(false);
  setClientSecret("");
}}
                        disabled={paymentLocked}
                        style={{ accentColor: "#16a34a" }}
                      />
                      <span className="gs-payment-label">
                        {method === "Cash on Delivery" ? "💵 " : "💳 "}{method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Finalize */}
              <div className="gs-card">
                <div className="gs-card-body" style={{ padding: 18 }}>
                  {isLeader && !isCompleted && paymentMethod === "Cash on Delivery" && (
                    <button
                      onClick={finalizeGroupOrder}
                      disabled={loading}
                      className="gs-action-btn"
                      style={{ background: loading ? "#86efac" : "#16a34a" }}
                    >
                      {loading ? "Processing..." : "Complete Group Order 🎉"}
                    </button>
                  )}

                  {isLeader && !isCompleted && paymentMethod === "Card Payment" && !stripeReady && (
                    <button
                      onClick={handleCreateGroupPaymentIntent}
                      disabled={loading}
                      className="gs-action-btn"
                      style={{ background: loading ? "#86efac" : "#16a34a" }}
                    >
                      {loading ? "Preparing Payment..." : "Continue to Group Card Payment 💳"}
                    </button>
                  )}

                  {isLeader && !isCompleted && paymentMethod === "Card Payment" && stripeReady && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <GroupStripePaymentForm onPaymentSuccess={handleGroupCardPaymentSuccess} />
                    </Elements>
                  )}

                  {!isLeader && !isCompleted && (
                    <div className="gs-info-box gs-info-lock">
                      <span>🔒</span>
                      <p style={{ fontSize: 13, color: "#b45309", fontWeight: 600, margin: 0 }}>Only the group leader can finalize this order.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default GroupSummary;




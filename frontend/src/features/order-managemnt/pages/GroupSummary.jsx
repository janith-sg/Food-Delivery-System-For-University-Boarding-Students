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

  const deliveryFee = groupData?.deliveryFee || 400;
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

  const glassCard = {
    borderRadius: 20,
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.75)",
    boxShadow: "0 6px 32px rgba(0,0,0,0.18)",
    overflow: "hidden",
  };

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
        <CustomerMenuBar
          onLogout={async () => {
            await clearAuthWithAudit();
            navigate("/login");
          }}
          onProfileClick={() => navigate(getProfilePath(getUser()))}
          cartItemsCount={0}
          onCartClick={() => navigate("/checkout")}
        />
        <div className="font-sans" style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", paddingTop: 100 }}>
          <svg style={{ animation: "go-spin 1s linear infinite", height: 36, width: 36, color: "#fff" }} fill="none" viewBox="0 0 24 24">
            <style>{"@keyframes go-spin { to { transform: rotate(360deg); } }"}</style>
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerMenuBar
        onLogout={async () => {
          await clearAuthWithAudit();
          navigate("/login");
        }}
        onProfileClick={() => navigate(getProfilePath(getUser()))}
        cartItemsCount={0}
        onCartClick={() => navigate("/checkout")}
      />
      <div className="font-sans" style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: 16 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header */}
          <div style={{
            borderRadius: 20,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(187,247,208,0.85)", margin: "0 0 4px" }}>
                Group Order
              </p>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 10px" }}>Order Summary 🧾</h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, fontFamily: "monospace", letterSpacing: "0.15em" }}>
                  {groupCode}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: isCompleted ? "#dcfce7" : "#fef3c7",
                  color: isCompleted ? "#166534" : "#92400e",
                }}>
                  {groupData?.status || "Loading..."}
                </span>
              </div>
            </div>
            <button onClick={onBack} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)", border: "none",
              color: "#fff", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
          </div>

          {/* Completed banner */}
          {isCompleted && (
            <div style={{ borderRadius: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <p style={{ fontWeight: 800, color: "#166534", fontSize: 14, margin: 0 }}>Group order completed!</p>
                <p style={{ fontSize: 12, color: "#16a34a", margin: "2px 0 0" }}>
                  Payment: {groupData?.paymentMethod || paymentMethod} · Status: {groupData?.paymentStatus || "Paid"}
                </p>
              </div>
            </div>
          )}

          {/* Two column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

            {/* Items card */}
            <div style={glassCard}>
              <div style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6", padding: "14px 20px" }}>
                <h2 style={{ fontSize: 12, fontWeight: 800, color: "#111827", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>📋 Shared Items</h2>
              </div>
              <div style={{ padding: 20 }}>
                {!groupData?.items?.length ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ fontSize: 32 }}>🍽️</div>
                    <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>No items added yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {groupData.items.map((item, index) => (
                      <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#f9fafb", borderRadius: 12, padding: 12, border: "1px solid #f3f4f6" }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>Added by {item.addedBy}</p>
                          <p style={{ fontSize: 12, color: "#6b7280", margin: "3px 0 0" }}>Rs. {item.price.toLocaleString()} × {item.qty}</p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>
                          Rs. {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div style={{ borderRadius: 12, background: "#f0fdf4", border: "1px solid #dcfce7", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4b5563" }}>
                        <span>Subtotal</span><span style={{ fontWeight: 600 }}>Rs. {subTotal.toLocaleString()}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4b5563" }}>
                        <span>Delivery Fee</span><span style={{ fontWeight: 600 }}>Rs. {deliveryFee.toLocaleString()}</span>
                      </div>
                      <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 800, color: "#111827", fontSize: 14 }}>Final Total</span>
                        <span style={{ fontWeight: 800, color: "#15803d", fontSize: 16 }}>Rs. {finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Bill split */}
              <div style={glassCard}>
                <div style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6", padding: "14px 20px" }}>
                  <h2 style={{ fontSize: 12, fontWeight: 800, color: "#111827", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>💰 Bill Split</h2>
                </div>
                <div style={{ padding: 20 }}>
                  {splitData.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>No split data yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {splitData.map((member, index) => (
                        <div key={index} style={{ borderRadius: 12, border: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{member.name}</p>
                            <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>
                              Food Rs. {member.subTotal.toLocaleString()} + Delivery Rs. {member.delivery.toFixed(0)}
                            </p>
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#15803d" }}>Rs. {member.total.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div style={glassCard}>
                <div style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: 12, fontWeight: 800, color: "#111827", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>💳 Payment Method</h2>
                  {/* Lock badge shown to non-leaders */}
                  {!isLeader && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 999 }}>
                      🔒 Leader only
                    </span>
                  )}
                </div>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Cash on Delivery", "Card Payment"].map((method) => (
                    <label key={method} style={{
                      display: "flex", alignItems: "center", gap: 12, borderRadius: 12,
                      border: `2px solid ${paymentMethod === method ? "#16a34a" : "#e5e7eb"}`,
                      background: paymentMethod === method ? "#f0fdf4" : "#f9fafb",
                      padding: "12px 16px",
                      // ── locked for non-leaders and completed orders ──
                      cursor: paymentLocked ? "not-allowed" : "pointer",
                      opacity: paymentLocked ? 0.55 : 1,
                      transition: "all 0.2s",
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
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>
                        {method === "Cash on Delivery" ? "💵 " : "💳 "}{method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Finalize */}
              <div style={{ ...glassCard, padding: 20 }}>
               {isLeader && !isCompleted && paymentMethod === "Cash on Delivery" && (
  <button
    onClick={finalizeGroupOrder}
    disabled={loading}
    style={{
      width: "100%",
      borderRadius: 12,
      padding: "14px 0",
      fontSize: 14,
      fontWeight: 800,
      color: "#fff",
      border: "none",
      cursor: loading ? "not-allowed" : "pointer",
      background: loading ? "#86efac" : "#16a34a",
      boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}
  >
    {loading ? "Processing..." : "Complete Group Order 🎉"}
  </button>
)}

{isLeader && !isCompleted && paymentMethod === "Card Payment" && !stripeReady && (
  <button
    onClick={handleCreateGroupPaymentIntent}
    disabled={loading}
    style={{
      width: "100%",
      borderRadius: 12,
      padding: "14px 0",
      fontSize: 14,
      fontWeight: 800,
      color: "#fff",
      border: "none",
      cursor: loading ? "not-allowed" : "pointer",
      background: loading ? "#86efac" : "#16a34a",
      boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px" }}>
                    <span>🔒</span>
                    <p style={{ fontSize: 13, color: "#b45309", fontWeight: 600, margin: 0 }}>Only the group leader can finalize this order.</p>
                  </div>
                )}
                {isCompleted && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px" }}>
                    <span>✅</span>
                    <p style={{ fontSize: 13, color: "#15803d", fontWeight: 600, margin: 0 }}>This group order has been completed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupSummary;
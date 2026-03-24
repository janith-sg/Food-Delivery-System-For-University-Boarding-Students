import React, { useEffect, useState } from "react";

const SLIDE_IMAGES = [
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1600&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80",
];

const GroupSummary = ({ groupCode, memberName, onBack }) => {
  const [groupData, setGroupData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrev(current);
      const next = (current + 1) % SLIDE_IMAGES.length;
      setCurrent(next);
      setTimeout(() => setPrev(null), 1200);
    }, 4500);
    return () => clearInterval(timer);
  }, [current]);

  const fetchGroup = async () => {
    setFetching(true);
    try {
      const res = await fetch(`http://localhost:5000/api/group-orders/${groupCode}`);
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

  const finalizeGroupOrder = async () => {
    if (!groupData?.items?.length) {
      alert("Please add items before completing the group order.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/group-orders/finalize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode, paymentMethod }),
      });
      const data = await response.json();
      if (response.ok) {
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

  // Slide style — extend beyond edges to hide blur fringe
  const slideBase = {
    position: "absolute", top: "-10px", left: "-10px", right: "-10px", bottom: "-10px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(5px)",
  };

  const Slideshow = () => (
    <>
      <style>{`
        @keyframes bg-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bg-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes kb-zoom     { from { transform: scale(1); } to { transform: scale(1.07); } }
        @keyframes go-spin     { to { transform: rotate(360deg); } }
        html, body, #root { margin: 0; padding: 0; background: #000; }
      `}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden" }}>
        {prev !== null && (
          <div style={{
            ...slideBase,
            backgroundImage: `url(${SLIDE_IMAGES[prev]})`,
            animation: "bg-fade-out 1.2s ease forwards",
          }} />
        )}
        <div style={{
          ...slideBase,
          backgroundImage: `url(${SLIDE_IMAGES[current]})`,
          animation: "bg-fade-in 1.2s ease forwards, kb-zoom 5s ease forwards",
        }} />

        {/* Subtle dark overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.35)",
        }} />

        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7, zIndex: 10 }}>
          {SLIDE_IMAGES.map((_, i) => (
            <span key={i} style={{
              display: "inline-block", height: 7, borderRadius: 999,
              width: i === current ? 22 : 7,
              background: i === current ? "#fff" : "rgba(255,255,255,0.38)",
              transition: "all 0.5s ease",
            }} />
          ))}
        </div>
      </div>
    </>
  );

  if (fetching) {
    return (
      <>
        <Slideshow />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", paddingTop: 100 }}>
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
      <Slideshow />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: 16 }}>
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
                <div style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6", padding: "14px 20px" }}>
                  <h2 style={{ fontSize: 12, fontWeight: 800, color: "#111827", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>💳 Payment Method</h2>
                </div>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Cash on Delivery", "Card Payment"].map((method) => (
                    <label key={method} style={{
                      display: "flex", alignItems: "center", gap: 12, borderRadius: 12,
                      border: `2px solid ${paymentMethod === method ? "#16a34a" : "#e5e7eb"}`,
                      background: paymentMethod === method ? "#f0fdf4" : "#f9fafb",
                      padding: "12px 16px",
                      cursor: isCompleted ? "not-allowed" : "pointer",
                      opacity: isCompleted ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}>
                      <input type="radio" name="paymentMethod" value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={isCompleted}
                        style={{ accentColor: "#16a34a" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>
                        {method === "Cash on Delivery" ? "💵 " : "💳 "}{method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Finalize */}
              <div style={{ ...glassCard, padding: 20 }}>
                {isLeader && !isCompleted && (
                  <button onClick={finalizeGroupOrder} disabled={loading} style={{
                    width: "100%", borderRadius: 12, padding: "14px 0", fontSize: 14, fontWeight: 800,
                    color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
                    background: loading ? "#86efac" : "#16a34a",
                    boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    {loading ? (
                      <>
                        <svg style={{ animation: "go-spin 1s linear infinite", height: 16, width: 16 }} fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Processing...
                      </>
                    ) : "Pay & Complete Group Order 🎉"}
                  </button>
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
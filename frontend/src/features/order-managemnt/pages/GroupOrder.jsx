import React, { useState, useEffect } from "react";

const SLIDE_IMAGES = [
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1600&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80",
];

const Field = ({ label, error, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{label}</label>
    {children}
    {error && (
      <p style={{ marginTop: 6, fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

const Spinner = () => (
  <svg style={{ animation: "go-spin 1s linear infinite", height: 16, width: 16 }} fill="none" viewBox="0 0 24 24">
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const GroupOrder = ({ onEnterGroup, onBack }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);

  const [title, setTitle] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [deadline, setDeadline] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createErrors, setCreateErrors] = useState({});
  const [joinErrors, setJoinErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrev(current);
      const next = (current + 1) % SLIDE_IMAGES.length;
      setCurrent(next);
      setTimeout(() => setPrev(null), 1200);
    }, 4500);
    return () => clearInterval(timer);
  }, [current]);

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  const isWithinAllowedTime = () => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= 8 * 60 && mins <= 22 * 60;
  };

  const validateCreate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Order title is required.";
    else if (title.trim().length < 3) errs.title = "Title must be at least 3 characters.";
    if (!createdBy.trim()) errs.createdBy = "Your name is required.";
    else if (!/^[a-zA-Z\s.'-]+$/.test(createdBy.trim())) errs.createdBy = "Name can only contain letters.";
    if (!deadline) errs.deadline = "Order deadline is required.";
    else if (deadline < minDateTime) errs.deadline = "Deadline must be in the future.";
    return errs;
  };

  const validateJoin = () => {
    const errs = {};
    if (!joinCode.trim()) errs.joinCode = "Group code is required.";
    else if (joinCode.trim().length < 4) errs.joinCode = "Enter a valid group code.";
    if (!joinName.trim()) errs.joinName = "Your name is required.";
    else if (!/^[a-zA-Z\s.'-]+$/.test(joinName.trim())) errs.joinName = "Name can only contain letters.";
    return errs;
  };

  const handleCreateGroup = async () => {
    setMessage({ text: "", type: "" });
    const errs = validateCreate();
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    setCreateErrors({});
    if (!isWithinAllowedTime()) {
      setMessage({ text: "Group orders are only allowed between 8:00 AM – 10:00 PM.", type: "error" });
      return;
    }
    setLoadingCreate(true);
    try {
      const response = await fetch("http://localhost:5000/api/group-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), createdBy: createdBy.trim(), deadline }),
      });
      const data = await response.json();
      if (response.ok) {
        onEnterGroup(data.groupOrder.groupCode, createdBy.trim());
      } else {
        setMessage({ text: data.message || "Failed to create group.", type: "error" });
      }
    } catch {
      setMessage({ text: "Connection error. Please try again.", type: "error" });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleJoinGroup = async () => {
    setMessage({ text: "", type: "" });
    const errs = validateJoin();
    if (Object.keys(errs).length > 0) { setJoinErrors(errs); return; }
    setJoinErrors({});
    setLoadingJoin(true);
    try {
      const response = await fetch("http://localhost:5000/api/group-orders/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode: joinCode.trim(), name: joinName.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        onEnterGroup(joinCode.trim(), joinName.trim());
      } else {
        setMessage({ text: data.message || "Failed to join group.", type: "error" });
      }
    } catch {
      setMessage({ text: "Connection error. Please try again.", type: "error" });
    } finally {
      setLoadingJoin(false);
    }
  };

  const inputStyle = (err) => ({
    width: "100%",
    borderRadius: 12,
    border: `1.5px solid ${err ? "#f87171" : "#e5e7eb"}`,
    padding: "12px 16px",
    fontSize: 14,
    outline: "none",
    background: err ? "#fef2f2" : "#f9fafb",
    boxSizing: "border-box",
  });

  const slideBase = {
    position: "absolute", top: "-10px", left: "-10px", right: "-10px", bottom: "-10px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(5px)",
  };

  return (
    <>
      <style>{`
        @keyframes go-spin    { to { transform: rotate(360deg); } }
        @keyframes bg-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bg-fade-out{ from { opacity: 1; } to { opacity: 0; } }
        @keyframes kb-zoom    { from { transform: scale(1); } to { transform: scale(1.07); } }
        html, body, #root { margin: 0; padding: 0; background: #000; }
        .back-btn:hover { background: rgba(255,255,255,0.28) !important; }
      `}</style>

      {/* ── BACKGROUND SLIDESHOW ── */}
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

      {/* ── PAGE CONTENT ── */}
      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* ── Header glass card ── */}
          <div style={{
            borderRadius: 20,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "20px 24px",
            marginBottom: 14,
            color: "#fff",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}>
            {/* Text info */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(187,247,208,0.9)", margin: "0 0 6px" }}>
                University Boarding Canteen
              </p>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px", color: "#fff" }}>
                Group Ordering 👥
              </h1>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.14)", borderRadius: 999, padding: "6px 14px",
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(220,252,231,0.95)" }}>
                  Available: 8:00 AM – 10:00 PM
                </span>
              </div>
            </div>

            {/* ── Back button ── */}
            {onBack && (
              <button
                className="back-btn"
                onClick={onBack}
                title="Back to Menu"
                style={{
                  flexShrink: 0,
                  width: 40, height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                  marginTop: 2,
                }}
              >
                ←
              </button>
            )}
          </div>

          {/* Main card */}
          <div style={{
            borderRadius: 20,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}>

            {/* Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f3f4f6" }}>
              <button onClick={() => { setActiveTab("create"); setMessage({ text: "", type: "" }); }} style={{
                padding: "15px 0", fontSize: 13, fontWeight: 800, border: "none", cursor: "pointer",
                background: activeTab === "create" ? "#16a34a" : "#fff",
                color: activeTab === "create" ? "#fff" : "#9ca3af",
                transition: "all 0.2s",
              }}>➕ Create Group</button>
              <button onClick={() => { setActiveTab("join"); setMessage({ text: "", type: "" }); }} style={{
                padding: "15px 0", fontSize: 13, fontWeight: 800, border: "none", cursor: "pointer",
                background: activeTab === "join" ? "#111827" : "#fff",
                color: activeTab === "join" ? "#fff" : "#9ca3af",
                transition: "all 0.2s",
              }}>🔗 Join Group</button>
            </div>

            {/* Banner */}
            {message.text && (
              <div style={{
                margin: "16px 20px 0", borderRadius: 12, padding: "11px 16px",
                fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
                background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                color: message.type === "success" ? "#15803d" : "#dc2626",
              }}>
                <span>{message.type === "success" ? "✅" : "⚠️"}</span>
                {message.text}
              </div>
            )}

            {/* Create form */}
            {activeTab === "create" && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Order Title *" error={createErrors.title}>
                  <input type="text" placeholder="e.g. Friday Night Feast" value={title}
                    onChange={(e) => { setTitle(e.target.value); setCreateErrors((p) => ({ ...p, title: "" })); }}
                    style={inputStyle(createErrors.title)} />
                </Field>
                <Field label="Your Name *" error={createErrors.createdBy}>
                  <input type="text" placeholder="e.g. Kavindu Perera" value={createdBy}
                    onChange={(e) => { setCreatedBy(e.target.value); setCreateErrors((p) => ({ ...p, createdBy: "" })); }}
                    style={inputStyle(createErrors.createdBy)} />
                </Field>
                <Field label="Order Deadline *" error={createErrors.deadline}>
                  <input type="datetime-local" value={deadline} min={minDateTime}
                    onChange={(e) => { setDeadline(e.target.value); setCreateErrors((p) => ({ ...p, deadline: "" })); }}
                    style={inputStyle(createErrors.deadline)} />
                </Field>
                <button onClick={handleCreateGroup} disabled={loadingCreate} style={{
                  width: "100%", borderRadius: 12, padding: "14px 0", fontSize: 14, fontWeight: 800,
                  color: "#fff", border: "none", cursor: loadingCreate ? "not-allowed" : "pointer",
                  background: loadingCreate ? "#86efac" : "#16a34a",
                  boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {loadingCreate ? <><Spinner /> Creating...</> : "Create Group →"}
                </button>
              </div>
            )}

            {/* Join form */}
            {activeTab === "join" && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Group Code *" error={joinErrors.joinCode}>
                  <input type="text" placeholder="e.g. GRP123" value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinErrors((p) => ({ ...p, joinCode: "" })); }}
                    style={{ ...inputStyle(joinErrors.joinCode), fontFamily: "monospace", letterSpacing: "0.25em" }} />
                </Field>
                <Field label="Your Name *" error={joinErrors.joinName}>
                  <input type="text" placeholder="e.g. Nimasha Silva" value={joinName}
                    onChange={(e) => { setJoinName(e.target.value); setJoinErrors((p) => ({ ...p, joinName: "" })); }}
                    style={inputStyle(joinErrors.joinName)} />
                </Field>
                <button onClick={handleJoinGroup} disabled={loadingJoin} style={{
                  width: "100%", borderRadius: 12, padding: "14px 0", fontSize: 14, fontWeight: 800,
                  border: "none", cursor: loadingJoin ? "not-allowed" : "pointer",
                  background: loadingJoin ? "#d1d5db" : "#111827",
                  color: loadingJoin ? "#9ca3af" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {loadingJoin ? <><Spinner /> Joining...</> : "Join Group →"}
                </button>
              </div>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 14, fontWeight: 500 }}>
            🔒 Secure group ordering for boarding students
          </p>
        </div>
      </div>
    </>
  );
};

export default GroupOrder;
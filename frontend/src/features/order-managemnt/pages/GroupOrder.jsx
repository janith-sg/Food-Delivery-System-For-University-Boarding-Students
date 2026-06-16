import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerMenuBar from "../../user-management/components/CustomerMenuBar";
import { clearAuthWithAudit, getUser } from "../../../lib/auth";
import { getProfilePath } from "../../../lib/postLoginRedirect";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const Field = ({ label, error, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#14532d", marginBottom: 8, letterSpacing: "0.02em", textTransform: "uppercase" }}>{label}</label>
    {children}
    {error && (
      <p style={{ marginTop: 6, fontSize: 12, color: "#b91c1c", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
        <span style={{ width: 16, height: 16, borderRadius: 999, background: "#fee2e2", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>!</span>
        {error}
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");

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
   // if (!isWithinAllowedTime()) {
   //   setMessage({ text: "Group orders are only allowed between 8:00 AM – 10:00 PM.", type: "error" });
   //   return;
   // }
    setLoadingCreate(true);
    try {
      const response = await fetch(apiUrl("/api/group-orders"), {
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
      const response = await fetch(apiUrl("/api/group-orders/join"), {
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

  return (
    <>
      <style>{`
        @keyframes go-spin    { to { transform: rotate(360deg); } }
        .back-btn:hover { background: rgba(255,255,255,0.28) !important; }
        .go-page {
          min-height: 100vh;
          padding: 18px 16px 28px;
          background:
            radial-gradient(circle at top left, rgba(34,197,94,0.12), transparent 30%),
            radial-gradient(circle at top right, rgba(16,185,129,0.10), transparent 26%),
            #f0fdf4;
        }
        .go-shell {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
        }
        .go-hero {
          border-radius: 24px;
          background: linear-gradient(135deg, #14532d 0%, #16a34a 52%, #22c55e 100%);
          padding: 22px 24px;
          margin-bottom: 14px;
          color: #fff;
          box-shadow: 0 18px 42px rgba(20,83,45,0.22);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .go-hero-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }
        .go-kicker {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(220,252,231,0.9);
          margin: 0 0 8px;
        }
        .go-title {
          margin: 0 0 12px;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.03em;
        }
        .go-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 12px;
          font-weight: 700;
          color: rgba(240,253,244,0.96);
        }
        .go-hero-btn {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.12);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: transform 0.18s ease, background 0.18s ease;
        }
        .go-hero-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.2); }
        .go-card {
          border-radius: 24px;
          background: #fff;
          border: 1px solid #bbf7d0;
          box-shadow: 0 18px 54px rgba(20,83,45,0.10);
          overflow: hidden;
        }
        .go-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f0fdf4;
          border-bottom: 1px solid #d1fae5;
        }
        .go-tab {
          padding: 15px 14px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          color: #166534;
          background: transparent;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .go-tab-inactive {
          color: #6b7280;
          background: #fff;
        }
        .go-tab-active {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #fff;
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.12);
        }
        .go-message {
          margin: 16px 20px 0;
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 600;
        }
        .go-message-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        .go-message-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }
        .go-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .go-label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #14532d;
          margin-bottom: 6px;
        }
        .go-input {
          width: 100%;
          border-radius: 14px;
          border: 1.5px solid #d1fae5;
          padding: 12px 14px;
          font-size: 14px;
          color: #14532d;
          outline: none;
          background: #f8fdfa;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .go-input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
          background: #fff;
        }
        .go-input-error { border-color: #fca5a5; background: #fffafa; }
        .go-error {
          margin-top: 6px;
          font-size: 12px;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
        .go-action {
          width: 100%;
          border-radius: 14px;
          padding: 14px 16px;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 10px 24px rgba(22,163,74,0.18);
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }
        .go-action:hover { transform: translateY(-1px); }
        .go-action-create { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
        .go-action-join { background: linear-gradient(135deg, #14532d, #15803d); color: #fff; }
        .go-footer {
          text-align: center;
          font-size: 12px;
          color: #4b5563;
          margin-top: 14px;
          font-weight: 600;
        }
      `}</style>

      <CustomerMenuBar
        onLogout={async () => {
          await clearAuthWithAudit();
          navigate("/login");
        }}
        onProfileClick={() => navigate(getProfilePath(getUser()))}
        cartItemsCount={0}
        onCartClick={() => navigate("/checkout")}
      />

      {/* ── PAGE CONTENT ── */}
      <div className="go-page font-sans">
        <div className="go-shell">

          {/* ── Header glass card ── */}
          <div className="go-hero">
            <div className="go-hero-top">
            {/* Text info */}
            <div>
              <h1 className="go-title">
                Group Ordering 👥
              </h1>
              <div className="go-badge">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                <span>
                  Available: 8:00 AM – 10:00 PM
                </span>
              </div>
            </div>

            {/* ── Back button ── */}
            {onBack && (
              <button
                className="back-btn go-hero-btn"
                onClick={onBack}
                title="Back to Menu"
              >
                ←
              </button>
            )}
            </div>
          </div>

          {/* Main card */}
          <div className="go-card">

            {/* Tabs */}
            <div className="go-tabs">
              <button onClick={() => { setActiveTab("create"); setMessage({ text: "", type: "" }); }} className={`go-tab ${activeTab === "create" ? "go-tab-active" : "go-tab-inactive"}`}>➕ Create Group</button>
              <button onClick={() => { setActiveTab("join"); setMessage({ text: "", type: "" }); }} className={`go-tab ${activeTab === "join" ? "go-tab-active" : "go-tab-inactive"}`}>🔗 Join Group</button>
            </div>

            {/* Banner */}
            {message.text && (
              <div className={`go-message ${message.type === "success" ? "go-message-success" : "go-message-error"}`}>
                <span>{message.type === "success" ? "✅" : "⚠️"}</span>
                {message.text}
              </div>
            )}

            {/* Create form */}
            {activeTab === "create" && (
              <div className="go-form">
                <Field label="Order Title *" error={createErrors.title}>
                  <input type="text" placeholder="e.g. Friday Night Feast" value={title}
                    onChange={(e) => { setTitle(e.target.value); setCreateErrors((p) => ({ ...p, title: "" })); }}
                    className={`go-input${createErrors.title ? " go-input-error" : ""}`} />
                </Field>
                <Field label="Your Name *" error={createErrors.createdBy}>
                  <input type="text" placeholder="e.g. Kavindu Perera" value={createdBy}
                    onChange={(e) => { setCreatedBy(e.target.value); setCreateErrors((p) => ({ ...p, createdBy: "" })); }}
                    className={`go-input${createErrors.createdBy ? " go-input-error" : ""}`} />
                </Field>
                <Field label="Order Deadline *" error={createErrors.deadline}>
                  <input type="datetime-local" value={deadline} min={minDateTime}
                    onChange={(e) => { setDeadline(e.target.value); setCreateErrors((p) => ({ ...p, deadline: "" })); }}
                    className={`go-input${createErrors.deadline ? " go-input-error" : ""}`} />
                </Field>
                <button onClick={handleCreateGroup} disabled={loadingCreate} className="go-action go-action-create">
                  {loadingCreate ? <><Spinner /> Creating...</> : "Create Group →"}
                </button>
              </div>
            )}

            {/* Join form */}
            {activeTab === "join" && (
              <div className="go-form">
                <Field label="Group Code *" error={joinErrors.joinCode}>
                  <input type="text" placeholder="e.g. GRP123" value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinErrors((p) => ({ ...p, joinCode: "" })); }}
                    className={`go-input${joinErrors.joinCode ? " go-input-error" : ""}`}
                    style={{ fontFamily: "monospace", letterSpacing: "0.25em" }} />
                </Field>
                <Field label="Your Name *" error={joinErrors.joinName}>
                  <input type="text" placeholder="e.g. Nimasha Silva" value={joinName}
                    onChange={(e) => { setJoinName(e.target.value); setJoinErrors((p) => ({ ...p, joinName: "" })); }}
                    className={`go-input${joinErrors.joinName ? " go-input-error" : ""}`} />
                </Field>
                <button onClick={handleJoinGroup} disabled={loadingJoin} className="go-action go-action-join">
                  {loadingJoin ? <><Spinner /> Joining...</> : "Join Group →"}
                </button>
              </div>
            )}
          </div>

          <p className="go-footer">
            🔒 Secure group ordering for boarding students
          </p>
        </div>
      </div>
    </>
  );
};

export default GroupOrder;
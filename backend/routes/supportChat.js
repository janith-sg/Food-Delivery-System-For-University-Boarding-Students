const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SupportConversation = require("../models/SupportConversation");
const SupportMessage = require("../models/SupportMessage");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();

function normalizeText(value, max = 2000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeGuestId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 120);
}

function userDisplayName(user) {
  const fullName = String(user?.fullName || "").trim();
  if (fullName) return fullName;
  const email = String(user?.email || "").trim();
  if (email) return email;
  const raw = String(user?._id || "");
  return `User-${raw.slice(-6) || "Unknown"}`;
}

function guestDisplayName(guestId, guestName) {
  const gName = normalizeText(guestName, 80);
  if (gName) return gName;
  const short = (guestId || "guest").slice(-6).toUpperCase();
  return `Guest-${short}`;
}

async function tryGetAuthUser(req) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret);
    if (!payload?.sub) return null;
    const user = await User.findById(payload.sub).lean();
    return user || null;
  } catch {
    return null;
  }
}

function isAdmin(user) {
  return String(user?.accountType || "").toLowerCase() === "admin";
}

async function getOrCreateConversationForClient({ user, guestId, guestName }) {
  const isLoggedIn = Boolean(user?._id);
  let key = "";
  let displayName = "";

  if (isLoggedIn) {
    key = `user:${user._id.toString()}`;
    displayName = userDisplayName(user);
  } else {
    const normalizedGuestId = normalizeGuestId(guestId);
    if (!normalizedGuestId) {
      throw new Error("guestId is required for guest chat.");
    }
    key = `guest:${normalizedGuestId}`;
    displayName = guestDisplayName(normalizedGuestId, guestName);
  }

  const filter = { key };
  const update = {
    $set: {
      key,
      userRef: isLoggedIn ? user._id : null,
      guestId: isLoggedIn ? "" : normalizeGuestId(guestId),
      displayName,
      lastMessageAt: new Date(),
    },
    $setOnInsert: {
      unreadForAdmin: 0,
      unreadForUser: 0,
      lastMessagePreview: "",
      status: "open",
      guestName: isLoggedIn ? "" : normalizeText(guestName, 80),
    },
  };

  const convo = await SupportConversation.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  }).lean();

  return convo;
}

async function assertConversationAccess(req, res, conversationId, { requireAdminAccess = false } = {}) {
  const convo = await SupportConversation.findById(conversationId).lean();
  if (!convo) {
    res.status(404).json({ message: "Conversation not found." });
    return null;
  }

  const authUser = await tryGetAuthUser(req);
  if (requireAdminAccess) {
    if (!isAdmin(authUser)) {
      res.status(403).json({ message: "Admin access required." });
      return null;
    }
    return { convo, authUser, accessAs: "admin" };
  }

  if (isAdmin(authUser)) {
    return { convo, authUser, accessAs: "admin" };
  }

  if (authUser?._id && convo.userRef && String(convo.userRef) === String(authUser._id)) {
    return { convo, authUser, accessAs: "user" };
  }

  const providedGuestId = normalizeGuestId(
    req.headers["x-guest-id"] || req.query.guestId || req.body?.guestId
  );
  if (!authUser && providedGuestId && convo.guestId && providedGuestId === convo.guestId) {
    return { convo, authUser: null, accessAs: "guest" };
  }

  res.status(403).json({ message: "Not allowed to access this conversation." });
  return null;
}

function mapConversation(convo) {
  return {
    id: convo._id.toString(),
    displayName: convo.displayName || "Unknown",
    status: convo.status || "open",
    lastMessageAt: convo.lastMessageAt ? new Date(convo.lastMessageAt).toISOString() : null,
    lastMessagePreview: convo.lastMessagePreview || "",
    unreadForAdmin: Number(convo.unreadForAdmin || 0),
    unreadForUser: Number(convo.unreadForUser || 0),
    guestId: convo.guestId || "",
    userRef: convo.userRef ? convo.userRef.toString() : null,
  };
}

function mapMessage(msg) {
  return {
    id: msg._id.toString(),
    senderType: msg.senderType,
    senderName: msg.senderName || "",
    text: msg.text || "",
    createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : null,
  };
}

/** Open (or create) conversation for current user or guest */
router.post("/session", async (req, res) => {
  try {
    const authUser = await tryGetAuthUser(req);
    const guestId = req.body?.guestId;
    const guestName = req.body?.guestName;

    const convo = await getOrCreateConversationForClient({
      user: authUser,
      guestId,
      guestName,
    });

    const latestMessages = await SupportMessage.find({ conversationRef: convo._id })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    return res.json({
      conversation: mapConversation(convo),
      messages: latestMessages.reverse().map(mapMessage),
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || "Could not open support chat session." });
  }
});

/** Current user/guest: get conversation messages */
router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const access = await assertConversationAccess(req, res, req.params.id);
    if (!access) return;

    const docs = await SupportMessage.find({ conversationRef: access.convo._id })
      .sort({ createdAt: 1 })
      .limit(500)
      .lean();

    return res.json(docs.map(mapMessage));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not load messages." });
  }
});

/** Current user/guest: send message */
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const access = await assertConversationAccess(req, res, req.params.id);
    if (!access) return;

    const text = normalizeText(req.body?.text);
    if (!text) {
      return res.status(400).json({ message: "Message text is required." });
    }

    const senderType = access.accessAs === "guest" ? "guest" : isAdmin(access.authUser) ? "admin" : "user";
    const senderName =
      senderType === "guest"
        ? guestDisplayName(access.convo.guestId, access.convo.guestName)
        : userDisplayName(access.authUser);

    const doc = await SupportMessage.create({
      conversationRef: access.convo._id,
      senderType,
      senderRef: access.authUser?._id || null,
      senderName,
      text,
    });

    const update = {
      lastMessageAt: new Date(),
      lastMessagePreview: text.slice(0, 140),
    };
    if (senderType === "admin") {
      update.unreadForUser = Number(access.convo.unreadForUser || 0) + 1;
    } else {
      update.unreadForAdmin = Number(access.convo.unreadForAdmin || 0) + 1;
    }
    await SupportConversation.updateOne({ _id: access.convo._id }, { $set: update });

    return res.status(201).json(mapMessage(doc.toObject()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not send message." });
  }
});

/** Current user/guest: mark conversation read for current side */
router.patch("/conversations/:id/read", async (req, res) => {
  try {
    const access = await assertConversationAccess(req, res, req.params.id);
    if (!access) return;

    const set =
      access.accessAs === "admin"
        ? { unreadForAdmin: 0 }
        : {
            unreadForUser: 0,
          };
    await SupportConversation.updateOne({ _id: access.convo._id }, { $set: set });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not update read state." });
  }
});

/** Admin: list all support conversations */
router.get("/admin/conversations", requireAdmin, async (req, res) => {
  try {
    const q = normalizeText(req.query.q, 120).toLowerCase();
    const docs = await SupportConversation.find({})
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(800)
      .lean();

    let rows = docs.map(mapConversation);
    if (q) {
      rows = rows.filter((r) => {
        return (
          String(r.displayName || "").toLowerCase().includes(q) ||
          String(r.lastMessagePreview || "").toLowerCase().includes(q)
        );
      });
    }

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not load support conversations." });
  }
});

/** Admin: get messages for one conversation */
router.get("/admin/conversations/:id/messages", requireAdmin, async (req, res) => {
  try {
    const convo = await SupportConversation.findById(req.params.id).lean();
    if (!convo) return res.status(404).json({ message: "Conversation not found." });

    const docs = await SupportMessage.find({ conversationRef: convo._id })
      .sort({ createdAt: 1 })
      .limit(800)
      .lean();

    return res.json({
      conversation: mapConversation(convo),
      messages: docs.map(mapMessage),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not load conversation messages." });
  }
});

/** Admin: reply to a conversation */
router.post("/admin/conversations/:id/messages", requireAdmin, async (req, res) => {
  try {
    const convo = await SupportConversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: "Conversation not found." });

    const text = normalizeText(req.body?.text);
    if (!text) return res.status(400).json({ message: "Message text is required." });

    const senderName = userDisplayName(req.authUser || req.authUserDoc);
    const doc = await SupportMessage.create({
      conversationRef: convo._id,
      senderType: "admin",
      senderRef: req.authUser?._id || req.authUserDoc?._id || null,
      senderName,
      text,
    });

    convo.lastMessageAt = new Date();
    convo.lastMessagePreview = text.slice(0, 140);
    convo.unreadForUser = Number(convo.unreadForUser || 0) + 1;
    await convo.save();

    return res.status(201).json(mapMessage(doc.toObject()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not send admin message." });
  }
});

/** Admin: mark as read (admin side) */
router.patch("/admin/conversations/:id/read", requireAdmin, async (req, res) => {
  try {
    await SupportConversation.updateOne({ _id: req.params.id }, { $set: { unreadForAdmin: 0 } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not mark conversation as read." });
  }
});

module.exports = router;

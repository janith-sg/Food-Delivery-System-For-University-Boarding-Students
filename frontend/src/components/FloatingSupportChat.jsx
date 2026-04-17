import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { getToken, getUser, syncAxiosAuth } from '../lib/auth';

const GUEST_ID_KEY = 'uni-eats-support-guest-id';
const REFRESH_MS = 4000;

function ensureGuestId() {
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const next =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `g-${crypto.randomUUID()}`
      : `g-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(GUEST_ID_KEY, next);
  return next;
}

function mapMine(senderType, currentUser) {
  if (senderType === 'admin') return false;
  if (currentUser) return senderType === 'user';
  return senderType === 'guest';
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function FloatingSupportChat() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const listRef = useRef(null);
  const currentUser = useMemo(() => getUser(), [open]);

  const sessionPayload = useMemo(() => {
    if (currentUser) return {};
    return { guestId: ensureGuestId() };
  }, [currentUser]);

  const openSession = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      syncAxiosAuth();
      const headers = {};
      if (!getToken() && sessionPayload.guestId) {
        headers['x-guest-id'] = sessionPayload.guestId;
      }
      const { data } = await axios.post('/api/support-chat/session', sessionPayload, { headers });
      setConversation(data?.conversation || null);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not open support chat.');
    } finally {
      setLoading(false);
    }
  }, [sessionPayload]);

  const refreshMessages = useCallback(async () => {
    if (!conversation?.id) return;
    try {
      const headers = {};
      if (!getToken() && sessionPayload.guestId) {
        headers['x-guest-id'] = sessionPayload.guestId;
      }
      const { data } = await axios.get(`/api/support-chat/conversations/${conversation.id}/messages`, {
        params: !getToken() ? { guestId: sessionPayload.guestId } : undefined,
        headers,
      });
      setMessages(Array.isArray(data) ? data : []);
      await axios.patch(
        `/api/support-chat/conversations/${conversation.id}/read`,
        !getToken() ? { guestId: sessionPayload.guestId } : {},
        { headers },
      );
    } catch {
      // keep quiet during background refresh
    }
  }, [conversation?.id, sessionPayload.guestId]);

  useEffect(() => {
    if (!open) return;
    openSession();
  }, [open, openSession]);

  useEffect(() => {
    if (!open || !conversation?.id) return;
    const id = setInterval(refreshMessages, REFRESH_MS);
    return () => clearInterval(id);
  }, [open, conversation?.id, refreshMessages]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !conversation?.id || sending) return;
    setSending(true);
    setError('');
    try {
      const headers = {};
      if (!getToken() && sessionPayload.guestId) {
        headers['x-guest-id'] = sessionPayload.guestId;
      }
      const { data } = await axios.post(
        `/api/support-chat/conversations/${conversation.id}/messages`,
        !getToken() ? { text, guestId: sessionPayload.guestId } : { text },
        { headers },
      );
      setMessages((prev) => [...prev, data]);
      setDraft('');
      refreshMessages();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      {open ? (
        <div
          className="pointer-events-auto flex max-h-[min(72vh,520px)] w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
          role="dialog"
          aria-label="Support chat"
        >
          <div className="flex items-center justify-between gap-2 border-b border-black/10 bg-[#0B8E3A] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="font-sans text-base font-semibold tracking-tight">UNI EATS Support</p>
              <p className="text-xs text-emerald-100/95">
                {conversation?.displayName
                  ? `Conversation: ${conversation.displayName}`
                  : currentUser
                    ? 'Signed in support'
                    : 'Guest support'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-white p-4">
            {loading ? <p className="text-sm text-black/60">Loading chat...</p> : null}
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            {!loading && messages.length === 0 ? (
              <p className="text-sm text-black/60">Start chatting with UNI EATS support.</p>
            ) : null}
            {messages.map((m) => {
              const mine = mapMine(m.senderType, currentUser);
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm leading-relaxed shadow-sm ${
                      mine
                        ? 'rounded-br-md bg-[#0B8E3A] text-white'
                        : 'rounded-bl-md border border-black/10 bg-[#FAFAFA] text-black'
                    }`}
                  >
                    {!mine ? (
                      <p className="mb-1 text-[11px] font-medium text-black/60">{m.senderName || 'Support'}</p>
                    ) : null}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <p className={`mt-1 text-[10px] ${mine ? 'text-white/80' : 'text-black/40'}`}>
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-black/10 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-black/15 bg-[#FAFAFA] px-3 py-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Type a message..."
                className="min-w-0 flex-1 bg-transparent font-sans text-sm text-black outline-none placeholder:text-black/40"
                aria-label="Message input"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!conversation?.id || !draft.trim() || sending}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B8E3A] text-white transition hover:bg-[#087532] disabled:cursor-not-allowed disabled:bg-[#0B8E3A]/35"
                aria-label="Send message"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B8E3A] text-white shadow-lg ring-4 ring-white transition hover:bg-[#087532] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8E3A] focus-visible:ring-offset-2"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        aria-expanded={open}
      >
        {open ? (
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

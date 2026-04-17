import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import AdminPageShell from '../../components/AdminPageShell';

const REFRESH_MS = 5000;

function formatTs(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${mi}`;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId],
  );

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingConvos(true);
      setError('');
      const params = {};
      const q = search.trim();
      if (q) params.q = q;
      const { data } = await axios.get('/api/support-chat/admin/conversations', { params });
      const rows = Array.isArray(data) ? data : [];
      setConversations(rows);
      if (!selectedId && rows[0]?.id) {
        setSelectedId(rows[0].id);
      } else if (selectedId && !rows.some((r) => r.id === selectedId)) {
        setSelectedId(rows[0]?.id || '');
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load chat conversations.');
      setConversations([]);
    } finally {
      if (!silent) setLoadingConvos(false);
    }
  }, [search, selectedId]);

  const fetchMessages = useCallback(async (conversationId, silent = false) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    try {
      if (!silent) setLoadingMessages(true);
      const { data } = await axios.get(`/api/support-chat/admin/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      await axios.patch(`/api/support-chat/admin/conversations/${conversationId}/read`);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load messages.');
      setMessages([]);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations(false);
  }, [fetchConversations]);

  useEffect(() => {
    fetchMessages(selectedId, false);
  }, [selectedId, fetchMessages]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchConversations(true);
      if (selectedId) fetchMessages(selectedId, true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchConversations, fetchMessages, selectedId]);

  const sendReply = async () => {
    const text = messageText.trim();
    if (!selectedId || !text || sending) return;
    setSending(true);
    try {
      const { data } = await axios.post(`/api/support-chat/admin/conversations/${selectedId}/messages`, {
        text,
      });
      setMessages((prev) => [...prev, data]);
      setMessageText('');
      fetchConversations(true);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPageShell title="Support Chat">
      <div className="mt-8 grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="w-full rounded-md border border-slate-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-admin-accent"
              />
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto">
            {loadingConvos ? (
              <p className="p-4 text-sm text-slate-500">Loading chats...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    c.id === selectedId ? 'bg-slate-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">{c.displayName || 'Unknown'}</p>
                    {Number(c.unreadForAdmin || 0) > 0 ? (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {c.unreadForAdmin}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.lastMessagePreview || 'No messages yet'}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{formatTs(c.lastMessageAt)}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[65vh] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {selectedConversation?.displayName || 'Select a conversation'}
            </h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {loadingMessages ? (
              <p className="text-sm text-slate-500">Loading messages...</p>
            ) : !selectedId ? (
              <p className="text-sm text-slate-500">Choose a conversation from the left.</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-500">No messages yet.</p>
            ) : (
              messages.map((m) => {
                const isAdmin = m.senderType === 'admin';
                return (
                  <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        isAdmin ? 'rounded-br-md bg-emerald-600 text-white' : 'rounded-bl-md bg-white text-slate-900'
                      }`}
                    >
                      <p className={`mb-1 text-[11px] ${isAdmin ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {m.senderName || m.senderType}
                      </p>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className={`mt-1 text-[10px] ${isAdmin ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {formatTs(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 p-3">
            {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendReply();
                }}
                disabled={!selectedId || sending}
                placeholder={selectedId ? 'Reply to this chat...' : 'Select a chat first'}
                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-admin-accent disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={sendReply}
                disabled={!selectedId || !messageText.trim() || sending}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
}

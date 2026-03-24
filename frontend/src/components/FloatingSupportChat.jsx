import React, { useState } from 'react';

/** Static demo messages — UI only, no send/API logic */
const DUMMY_MESSAGES = [
  { id: 1, from: 'bot', text: 'Hi! 👋 Welcome to UNI EATS. How can we help you today?' },
  { id: 2, from: 'user', text: 'What are today’s lunch options?' },
  {
    id: 3,
    from: 'bot',
    text: 'Today we’re featuring rice & curry, vegetarian lunchbox, and yellow rice bowls. You can browse the full menu on the Our Menu section!',
  },
  { id: 4, from: 'user', text: 'Do you deliver to Pittugala?' },
  {
    id: 5,
    from: 'bot',
    text: 'Yes - we deliver around campus including pittugala. Typical delivery windows are 11:30-2:00 PM on weekdays.',
  },
];

export default function FloatingSupportChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      {open ? (
        <div
          className="pointer-events-auto flex max-h-[min(72vh,520px)] w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
          role="dialog"
          aria-label="Support chat demo"
        >
          <div className="flex items-center justify-between gap-2 border-b border-black/10 bg-[#0B8E3A] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="font-sans text-base font-semibold tracking-tight">UNI EATS Support</p>
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

          <div className="flex-1 space-y-3 overflow-y-auto bg-white p-4">
            {DUMMY_MESSAGES.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm leading-relaxed shadow-sm ${
                    m.from === 'user'
                      ? 'rounded-br-md bg-[#0B8E3A] text-white'
                      : 'rounded-bl-md border border-black/10 bg-[#FAFAFA] text-black'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-black/10 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-black/15 bg-[#FAFAFA] px-3 py-2">
              <input
                type="text"
                readOnly
                placeholder="Type a message..."
                className="min-w-0 flex-1 bg-transparent font-sans text-sm text-black outline-none placeholder:text-black/40"
                aria-label="Message input"
              />
              <button
                type="button"
                disabled
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B8E3A]/35 text-white"
                aria-hidden
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

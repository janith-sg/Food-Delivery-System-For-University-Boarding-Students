import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * SweetAlert-style dialog with animated success check or error X (SVG path draw).
 * @param {{ open: boolean; variant: 'success' | 'error'; title: string; message: string; onClose: () => void }} props
 */
export default function FeedbackModal({ open, variant, title, message, onClose }) {
  const isSuccess = variant === 'success';

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          aria-describedby="feedback-modal-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-[22rem] rounded-2xl bg-white px-6 pb-6 pt-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center">
              {isSuccess ? <AnimatedSuccessMark /> : <AnimatedErrorMark />}
            </div>

            <h2 id="feedback-modal-title" className="mt-4 text-xl font-bold text-slate-800">
              {title}
            </h2>
            <p id="feedback-modal-desc" className="mt-2 text-sm leading-relaxed text-slate-600">
              {message}
            </p>

            <button
              type="button"
              onClick={onClose}
              className={
                isSuccess
                  ? 'mt-6 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50'
                  : 'mt-6 w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-red-700'
              }
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

function AnimatedSuccessMark() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill="#f0fdf4"
        stroke="#86efac"
        strokeWidth="3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      />
      <motion.path
        fill="none"
        stroke="#16a34a"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M28 52 L42 66 L72 36"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 },
          opacity: { duration: 0.15, delay: 0.1 },
        }}
      />
    </svg>
  );
}

function AnimatedErrorMark() {
  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center"
      initial={{ x: 0 }}
      animate={{ x: [0, -5, 5, -5, 5, 0] }}
      transition={{ duration: 0.45, delay: 0.32, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="#fef2f2"
          stroke="#fca5a5"
          strokeWidth="3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        />
        <motion.path
          fill="none"
          stroke="#dc2626"
          strokeWidth="6"
          strokeLinecap="round"
          d="M35 35 L65 65"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ pathLength: { duration: 0.22, ease: 'easeOut', delay: 0.1 }, opacity: { delay: 0.08, duration: 0.12 } }}
        />
        <motion.path
          fill="none"
          stroke="#dc2626"
          strokeWidth="6"
          strokeLinecap="round"
          d="M65 35 L35 65"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ pathLength: { duration: 0.22, ease: 'easeOut', delay: 0.2 }, opacity: { delay: 0.18, duration: 0.12 } }}
        />
      </svg>
    </motion.div>
  );
}

import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Replaces window.confirm with a styled dialog (matches FeedbackModal shell).
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) {
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancel();
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-[22rem] rounded-2xl bg-white px-6 pb-6 pt-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-modal-title" className="text-lg font-bold text-slate-800">
              {title}
            </h2>
            <p id="confirm-modal-desc" className="mt-2 text-sm leading-relaxed text-slate-600">
              {message}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:min-w-[6rem]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={
                  danger
                    ? 'w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-red-700 sm:w-auto sm:min-w-[6rem]'
                    : 'w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-violet-700 sm:w-auto sm:min-w-[6rem]'
                }
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

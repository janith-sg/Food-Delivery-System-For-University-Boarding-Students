import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';


export default function IdPhotoLightbox({ src, alt, children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!src) {
    return children;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block cursor-zoom-in border-0 bg-transparent p-0"
        aria-label={alt ? `View larger: ${alt}` : 'View ID photo larger'}
      >
        {children}
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="ID photo preview"
              onClick={() => setOpen(false)}
            >
              <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute -right-1 -top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg ring-2 ring-black/10 transition hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <img
                  src={src}
                  alt={alt || 'Student ID'}
                  className="max-h-[min(90vh,900px)] w-auto max-w-[min(96vw,1000px)] rounded-lg object-contain shadow-2xl"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

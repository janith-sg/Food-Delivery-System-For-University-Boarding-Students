import React from 'react';

/**
 * Shared header strip + title + description for admin section pages.
 * Optional classNames for layout variants (e.g. centered dashboard title).
 */
export default function AdminPageShell({
  title,
  description,
  children,
  stripClassName = '',
  /** Defaults to `text-xl md:text-2xl` when omitted; pass full size classes to override. */
  titleClassName = 'text-xl md:text-2xl',
  descriptionClassName = '',
}) {
  return (
    <>
      <div
        className={`mb-1 h-1 w-16 rounded-full bg-gradient-to-r from-[#16a34a] via-[#4ade80] to-[#2563eb] ${stripClassName}`}
        aria-hidden
      />
      <h1 className={`font-serif font-normal tracking-tight text-black ${titleClassName}`}>{title}</h1>
      {description ? (
        <p
          className={`mt-2 text-sm leading-relaxed font-normal text-black md:text-[15px] ${descriptionClassName}`}
        >
          {description}
        </p>
      ) : null}
      {children}
    </>
  );
}

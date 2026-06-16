import React from 'react';

/** Shared page header for all admin area screens (matches Staff Management / dashboard tone). */
export default function AdminPageShell({
  title,
  description,
  children,
  actions = null,
  stripClassName = '',
  titleClassName = 'text-2xl md:text-[1.75rem]',
  descriptionClassName = '',
}) {
  return (
    <>
      <div
        className={`mb-2 h-1 w-14 rounded-full bg-admin-accent ${stripClassName}`}
        aria-hidden
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className={`font-bold tracking-tight text-slate-900 ${titleClassName}`}>{title}</h1>
          {description ? (
            <p
              className={`mt-1.5 text-sm font-normal leading-relaxed text-admin-ink/90 md:text-[15px] ${descriptionClassName}`}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">{actions}</div>
        ) : null}
      </div>
      {children}
    </>
  );
}

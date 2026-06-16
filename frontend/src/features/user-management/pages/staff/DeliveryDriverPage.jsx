import React from 'react';
import { Link } from 'react-router-dom';

export default function DeliveryDriverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-lg ring-1 ring-green-100">
          🚚
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Delivery driver
        </h1>
        <p className="mt-3 text-sm text-gray-600 sm:text-base">
          You are signed in as a delivery driver. Use this area for assigned runs and delivery
          updates when those features are connected.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

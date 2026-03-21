import React from 'react';
import AdminPageShell from '../../components/AdminPageShell';

export default function SupportChatbotPage() {
  return (
    <AdminPageShell title="Support Chatbot">
      <div className="mt-6 rounded-xl border border-dashed border-[#93c5fd]/50 bg-gradient-to-r from-[#ecfdf5]/80 to-[#eff6ff]/80 p-4 text-sm font-normal text-black">
        <p>
          Chatbot integration for admin support can be wired here (routes, API, UI component).
        </p>
      </div>
    </AdminPageShell>
  );
}

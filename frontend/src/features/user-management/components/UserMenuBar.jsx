import React from 'react';

const UserMenuBar = ({ onLogout, onProfileClick }) => {
  const username = 'IndujaCustomer';

  return (
    <header className="w-full bg-white border-b border-[#48A111]/40">
      <div className="h-[64px] px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#48A111]/35 border border-[#48A111]/50 flex items-center justify-center text-[11px] font-extrabold text-[#48A111]">
            UE
          </div>
          <div className="text-[15px] font-extrabold text-black">UNI EATS</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onProfileClick}
            className="w-9 h-9 rounded-full bg-[#48A111]/35 border border-[#48A111]/50 flex items-center justify-center text-black hover:bg-[#48A111]/60 transition-all duration-200"
            aria-label="Open user profile"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="3" />
            </svg>
          </button>

          <div className="leading-tight">
            <div className="text-[12px] font-bold text-black">Hello</div>
            <div className="text-[13px] font-extrabold text-black">{username}</div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onLogout) onLogout();
            }}
            className="px-3 py-2 rounded-lg border border-[#48A111]/50 bg-[#48A111]/35 text-black text-[13px] font-bold transition-all duration-300 hover:bg-[#48A111]/70 hover:-translate-y-1 hover:shadow-lg hover:border-[#48A111]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default UserMenuBar;


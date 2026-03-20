import React, { useEffect, useState } from 'react';
import bg1 from '../mock/r1.png';
import bg2 from '../mock/r2.png';
import bg3 from '../mock/r3.png';

const LoginPage = () => {
  const backgrounds = [bg3, bg1, bg2];
  const [bgIndex, setBgIndex] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [registerType, setRegisterType] = useState('customer');

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [backgrounds.length]);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-6 flex items-center justify-start transition-all duration-700"
      style={{
        backgroundImage:
          `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url('${backgrounds[bgIndex]}')`,
      }}
    >
      {showRegister ? (
        <div className="font-['Poppins'] w-full max-w-[460px] min-h-[620px] ml-42 bg-white/95 backdrop-blur-[1px] rounded-2xl border border-[#48A111]/40 shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-[#48A111]/80 hover:-translate-y-1">
          <h1 className="text-3xl font-extrabold text-[#48A111] text-center">Register</h1>
          <div className="mt-2 text-center">
            <span className="text-sm text-[#48A111]/85">Already have an account? </span>
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className="text-sm font-bold text-[#48A111] hover:underline"
            >
              Login
            </button>
          </div>
          <div className="mt-2 text-center">
            {registerType === 'customer' ? (
              <button
                type="button"
                onClick={() => setRegisterType('staff')}
                className="text-sm font-semibold text-[#48A111] hover:underline"
              >
                Register as staff? Click here
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRegisterType('customer')}
                className="text-sm font-semibold text-[#48A111] hover:underline"
              >
                Register as customer? Click here
              </button>
            )}
          </div>

          <form className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
              />
            </div>

            {registerType === 'customer' ? (
              <>
                <div>
                  <label className="text-sm font-bold text-[#48A111]" htmlFor="studentId">
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    placeholder="Enter student ID"
                    className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#48A111]" htmlFor="studentIdPhoto">
                    Student ID Photo Upload
                  </label>
                  <input
                    id="studentIdPhoto"
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-bold text-[#48A111]" htmlFor="staffRole">
                  Staff Role
                </label>
                <select
                  id="staffRole"
                  className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
                >
                  <option>Delivery Manager</option>
                  <option>Order Manager</option>
                  <option>Food Menu Manager</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="registerEmail">
                Email
              </label>
              <input
                id="registerEmail"
                type="email"
                placeholder="name@example.com"
                className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="registerPassword">
                Password
              </label>
              <input
                id="registerPassword"
                type="password"
                placeholder="Enter password"
                className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
              />
            </div>

            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="w-full rounded-lg bg-[#48A111] py-2.5 text-white font-bold border-0 outline-none shadow-none m-0 transition-all duration-300 hover:bg-[#3d8e0c] hover:-translate-y-1 hover:shadow-lg"
            >
              Create Account
            </button>
          </form>
        </div>
      ) : (
        <div className="font-['Poppins'] w-full max-w-[420px] min-h-[520px] ml-42 bg-white/95 backdrop-blur-[1px] rounded-2xl border border-[#48A111]/40 shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-[#48A111]/80 hover:-translate-y-1">
          <h1 className="text-4xl font-extrabold text-[#48A111] text-center">Login</h1>
          <div className="mt-2 text-center">
            <span className="text-sm text-[#48A111]/85">New user? </span>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-sm font-bold text-[#48A111] hover:underline"
            >
              Register
            </button>
          </div>

          <form className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                className="mt-1 w-full rounded-lg border border-[#48A111]/40 bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/30"
              />
            </div>

            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="w-full rounded-lg bg-[#48A111] py-2.5 text-white font-bold border-0 outline-none shadow-none m-0 transition-all duration-300 hover:bg-[#3d8e0c] hover:-translate-y-1 hover:shadow-lg"
            >
              Login
            </button>

            <div className="text-left">
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-semibold text-[#48A111] hover:underline"
              >
                Forget your password?
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginPage;


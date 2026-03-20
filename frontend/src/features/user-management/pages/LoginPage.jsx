import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bg1 from '../mock/r1.png';
import bg2 from '../mock/r2.png';
import bg3 from '../mock/r3.png';
import { isValidEmail, digitsOnlyMax10, isPhone10Digits } from '../utils/formValidation';

const LoginPage = () => {
  const navigate = useNavigate();
  const backgrounds = [bg3, bg1, bg2];
  const [bgIndex, setBgIndex] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [registerType, setRegisterType] = useState('customer');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  const [regFullName, setRegFullName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regStudentPhoto, setRegStudentPhoto] = useState(null);
  const [regStaffRole, setRegStaffRole] = useState('Delivery Manager');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regErrors, setRegErrors] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [backgrounds.length]);

  const validateLogin = () => {
    const err = {};
    if (!loginEmail.trim()) err.email = 'Email is required.';
    else if (!isValidEmail(loginEmail)) err.email = 'Enter a valid email address.';
    if (!loginPassword.trim()) err.password = 'Password is required.';
    setLoginErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    navigate('/admin/dashboard');
  };

  const validateRegister = () => {
    const err = {};
    if (!regFullName.trim()) err.fullName = 'Full name is required.';
    if (!isPhone10Digits(regPhone)) err.phone = 'Phone must be exactly 10 digits (numbers only).';
    if (!regEmail.trim()) err.email = 'Email is required.';
    else if (!isValidEmail(regEmail)) err.email = 'Enter a valid email address.';
    if (!regPassword.trim()) err.password = 'Password is required.';

    if (registerType === 'customer') {
      if (!regStudentId.trim()) err.studentId = 'Student ID is required.';
      if (!regStudentPhoto) err.studentPhoto = 'Student ID photo is required.';
    } else {
      if (!regStaffRole) err.staffRole = 'Staff role is required.';
    }

    setRegErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    window.alert('Account created (UI only — no backend).');
  };

  const inputErrorClass = 'border-red-500 focus:ring-red-200';
  const inputOkClass = 'border-[#48A111]/40 focus:ring-[#48A111]/30';

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

          <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit} noValidate>
            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Enter your full name"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                  regErrors.fullName ? inputErrorClass : inputOkClass
                }`}
              />
              {regErrors.fullName ? <p className="mt-1 text-xs text-red-600">{regErrors.fullName}</p> : null}
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
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="Enter student ID"
                    className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                      regErrors.studentId ? inputErrorClass : inputOkClass
                    }`}
                  />
                  {regErrors.studentId ? <p className="mt-1 text-xs text-red-600">{regErrors.studentId}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-bold text-[#48A111]" htmlFor="studentIdPhoto">
                    Student ID Photo Upload
                  </label>
                  <input
                    id="studentIdPhoto"
                    type="file"
                    accept="image/*"
                    className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                      regErrors.studentPhoto ? inputErrorClass : inputOkClass
                    }`}
                    onChange={(e) => setRegStudentPhoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  />
                  {regErrors.studentPhoto ? <p className="mt-1 text-xs text-red-600">{regErrors.studentPhoto}</p> : null}
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-bold text-[#48A111]" htmlFor="staffRole">
                  Staff Role
                </label>
                <select
                  id="staffRole"
                  value={regStaffRole}
                  onChange={(e) => setRegStaffRole(e.target.value)}
                  className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                    regErrors.staffRole ? inputErrorClass : inputOkClass
                  }`}
                >
                  <option value="Delivery Manager">Delivery Manager</option>
                  <option value="Order Manager">Order Manager</option>
                  <option value="Food Menu Manager">Food Menu Manager</option>
                </select>
                {regErrors.staffRole ? <p className="mt-1 text-xs text-red-600">{regErrors.staffRole}</p> : null}
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="phoneNumber">
                Phone Number (10 digits)
              </label>
              <input
                id="phoneNumber"
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={regPhone}
                onChange={(e) => setRegPhone(digitsOnlyMax10(e.target.value))}
                placeholder="0712345678"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                  regErrors.phone ? inputErrorClass : inputOkClass
                }`}
              />
              {regErrors.phone ? <p className="mt-1 text-xs text-red-600">{regErrors.phone}</p> : null}
            </div>

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="registerEmail">
                Email
              </label>
              <input
                id="registerEmail"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@example.com"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                  regErrors.email ? inputErrorClass : inputOkClass
                }`}
              />
              {regErrors.email ? <p className="mt-1 text-xs text-red-600">{regErrors.email}</p> : null}
            </div>

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="registerPassword">
                Password
              </label>
              <input
                id="registerPassword"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Enter password"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                  regErrors.password ? inputErrorClass : inputOkClass
                }`}
              />
              {regErrors.password ? <p className="mt-1 text-xs text-red-600">{regErrors.password}</p> : null}
            </div>

            <button
              type="submit"
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

          <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit} noValidate>
            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                  loginErrors.email ? inputErrorClass : inputOkClass
                }`}
              />
              {loginErrors.email ? <p className="mt-1 text-xs text-red-600">{loginErrors.email}</p> : null}
            </div>

            <div>
              <label className="text-sm font-bold text-[#48A111]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-[#48A111] placeholder:text-[#48A111]/55 outline-none transition-all duration-300 hover:border-[#48A111]/80 hover:bg-[#48A111]/10 focus:border-[#48A111] focus:ring-2 ${
                  loginErrors.password ? inputErrorClass : inputOkClass
                }`}
              />
              {loginErrors.password ? <p className="mt-1 text-xs text-red-600">{loginErrors.password}</p> : null}
            </div>

            <button
              type="submit"
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

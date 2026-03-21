import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setAuth } from '../../../lib/auth';
import { isValidEmail, digitsOnlyMax10, isPhone10Digits } from '../utils/formValidation';
import food1 from '../../../assets/riceandcurry1.png';
import food2 from '../../../assets/lunchbox.png';
import food3 from '../../../assets/yellowRice.png';
import food4 from '../../../assets/rice and curry.jpg';

const MENU_IMAGES = [food1, food2, food3, food4];

function LeafIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  );
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [regApiError, setRegApiError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [loginApiError, setLoginApiError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const validateLogin = () => {
    const err = {};
    if (!loginEmail.trim()) err.email = 'Email is required.';
    else if (!isValidEmail(loginEmail)) err.email = 'Enter a valid email address.';
    if (!loginPassword.trim()) err.password = 'Password is required.';
    setLoginErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoginApiError('');
    setLoginSubmitting(true);
    try {
      const { data } = await axios.post('/api/login', {
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (data.token && data.user) {
        setAuth(data.token, data.user);
      }
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      setLoginApiError(msg);
    } finally {
      setLoginSubmitting(false);
    }
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setRegApiError('');
    setRegSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', regFullName.trim());
      fd.append('email', regEmail.trim());
      fd.append('password', regPassword);
      fd.append('phone', regPhone);
      fd.append('accountType', registerType === 'customer' ? 'customer' : 'staff');
      if (registerType === 'customer') {
        fd.append('studentId', regStudentId.trim());
        fd.append('studentPhoto', regStudentPhoto);
      } else {
        fd.append('staffRole', regStaffRole);
      }
      const { data } = await axios.post('/api/register', fd);
      window.alert(data.message || 'Account created.');
      setShowRegister(false);
      setRegFullName('');
      setRegStudentId('');
      setRegStudentPhoto(null);
      setRegPhone('');
      setRegEmail('');
      setRegPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setRegApiError(msg);
    } finally {
      setRegSubmitting(false);
    }
  };

  const inputErrorClass = 'border-red-400 focus:ring-red-100';
  const inputOkClass = 'border-[#354A3F]/20 focus:border-[#354A3F] focus:ring-2 focus:ring-[#354A3F]/15';

  const labelClass = 'text-sm font-semibold text-[#354A3F]';
  const linkClass = 'font-semibold text-[#354A3F] underline-offset-2 hover:underline';
  const btnPrimary =
    'w-full rounded-full bg-[#354A3F] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#2B3D32] hover:shadow-lg';

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2B2B2B]">
      {/* Top bar — matches landing */}
      <header className="border-b border-[#354A3F]/10 bg-[#F7F5F0]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#354A3F]/15 text-[#354A3F]">
              <LeafIcon className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-[#354A3F]">UNI EATS</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-[#354A3F]/80 transition hover:text-[#354A3F]"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="relative overflow-hidden">
        {/* Soft diagonal background — no photos */}
        <div
          className="absolute inset-0 -z-10 min-h-full"
          style={{
            background:
              'linear-gradient(165deg, #E6EDE8 0%, #E6EDE8 38%, #F0EBE3 38%, #F7F5F0 100%)',
          }}
        />
        <div className="pointer-events-none absolute left-4 top-24 text-[#354A3F]/10 md:left-12">
          <LeafIcon className="h-24 w-24" />
        </div>
        <div className="pointer-events-none absolute bottom-20 right-8 rotate-12 text-[#354A3F]/10">
          <LeafIcon className="h-20 w-20" />
        </div>

        <div
          className={`mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:items-start md:gap-16 md:px-8 ${
            showRegister ? 'py-5 md:py-8 lg:py-10' : 'py-8 md:py-12 lg:py-14'
          }`}
        >
          {/* Text + marquee — Login: left. Register: right (mirrored). Mobile: under form (login) or under form (register) */}
          <div
            className={`md:-translate-y-3 md:self-start lg:-translate-y-5 ${
              showRegister ? 'order-2 md:order-2' : 'order-2 md:order-1'
            }`}
          >
            <p className="text-sm font-medium uppercase tracking-widest text-[#354A3F]/70">
              {showRegister ? 'Join the community' : 'Welcome back'}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-[#354A3F] md:mt-3 md:text-5xl">
              {showRegister ? 'Create your account' : 'Sign in to order'}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#4a4a4a] md:mt-5">
              {showRegister
                ? 'Register as a student or staff member. Fresh meals, simple access — one place for campus dining.'
                : 'Access your dashboard, track orders, and manage your profile with the same calm, organic feel as our home page.'}
            </p>
            <div className="mt-6 hidden h-px max-w-xs bg-gradient-to-r from-[#354A3F]/30 to-transparent md:block" />

            {/* Animated food strip — scrolls continuously (right side enters, moves across, exits left) */}
            <div className="relative mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-[#354A3F]/15 bg-white/40 py-3 shadow-sm md:mt-7">
              <div className="login-marquee-track">
                {[...MENU_IMAGES, ...MENU_IMAGES].map((src, i) => (
                  <img
                    key={`${i}-${src}`}
                    src={src}
                    alt=""
                    className="h-[72px] w-[104px] shrink-0 rounded-xl border border-[#354A3F]/10 object-cover shadow-sm md:h-[88px] md:w-[120px]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Login: form right. Register: form left. Mobile: form first on both */}
          <div
            className={`md:self-start ${
              showRegister
                ? 'order-1 md:order-1 mt-1.5 md:mt-2'
                : 'order-1 md:order-2'
            }`}
          >
            <div
              className={`mx-auto w-full rounded-[24px] border border-white/80 bg-white shadow-xl shadow-[#354A3F]/10 ${
                showRegister
                  ? 'max-w-sm px-4 pb-4 pt-1.5 sm:max-w-[380px] sm:px-5 sm:pb-4 sm:pt-2 md:px-5 md:pb-5'
                  : 'max-w-md p-8'
              }`}
            >
              {showRegister ? (
                <>
                  <h2 className="mt-0 text-center font-serif text-2xl font-semibold leading-tight text-[#354A3F] md:text-3xl">
                    Register
                  </h2>
                  {regApiError ? (
                    <p className="mt-2 text-center text-xs text-red-600 sm:text-sm">{regApiError}</p>
                  ) : null}
                  <div className="mt-1 text-center text-[11px] text-[#5a5a5a] sm:text-xs">
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegApiError('');
                        setLoginApiError('');
                        setShowRegister(false);
                      }}
                      className={linkClass}
                    >
                      Login
                    </button>
                  </div>
                  <div className="mt-1 text-center">
                    {registerType === 'customer' ? (
                      <button
                        type="button"
                        onClick={() => setRegisterType('staff')}
                        className="text-[10px] font-medium leading-tight text-[#354A3F]/90 hover:underline sm:text-[11px]"
                      >
                        Register as staff? Click here
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRegisterType('customer')}
                        className="text-[10px] font-medium leading-tight text-[#354A3F]/90 hover:underline sm:text-[11px]"
                      >
                        Register as customer? Click here
                      </button>
                    )}
                  </div>

                  <form
                    className="mt-2 space-y-2 sm:mt-2.5 sm:space-y-2.5"
                    onSubmit={handleRegisterSubmit}
                    noValidate
                  >
                    <div>
                      <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="fullName">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${regErrors.fullName ? inputErrorClass : inputOkClass}`}
                      />
                      {regErrors.fullName ? <p className="mt-1 text-xs text-red-600">{regErrors.fullName}</p> : null}
                    </div>

                    {registerType === 'customer' ? (
                      <>
                        <div>
                          <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="studentId">
                            Student ID
                          </label>
                          <input
                            id="studentId"
                            type="text"
                            value={regStudentId}
                            onChange={(e) => setRegStudentId(e.target.value)}
                            placeholder="Enter student ID"
                            className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${regErrors.studentId ? inputErrorClass : inputOkClass}`}
                          />
                          {regErrors.studentId ? <p className="mt-1 text-xs text-red-600">{regErrors.studentId}</p> : null}
                        </div>

                        <div>
                          <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="studentIdPhoto">
                            Student ID Photo Upload
                          </label>
                          <input
                            id="studentIdPhoto"
                            type="file"
                            accept="image/*"
                            className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-2 text-xs text-[#2B2B2B] outline-none file:mr-2 file:rounded-lg file:border-0 file:bg-[#E6EDE8] file:px-2 file:py-1 file:text-xs file:font-medium file:text-[#354A3F] sm:text-sm sm:file:px-3 sm:file:py-1.5 sm:file:text-sm ${regErrors.studentPhoto ? inputErrorClass : inputOkClass}`}
                            onChange={(e) => setRegStudentPhoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                          />
                          {regErrors.studentPhoto ? <p className="mt-1 text-xs text-red-600">{regErrors.studentPhoto}</p> : null}
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="staffRole">
                          Staff Role
                        </label>
                        <select
                          id="staffRole"
                          value={regStaffRole}
                          onChange={(e) => setRegStaffRole(e.target.value)}
                          className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-[#2B2B2B] outline-none ${regErrors.staffRole ? inputErrorClass : inputOkClass}`}
                        >
                          <option value="Delivery Manager">Delivery Manager</option>
                          <option value="Order Manager">Order Manager</option>
                          <option value="Food Menu Manager">Food Menu Manager</option>
                        </select>
                        {regErrors.staffRole ? <p className="mt-1 text-xs text-red-600">{regErrors.staffRole}</p> : null}
                      </div>
                    )}

                    <div>
                      <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="phoneNumber">
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
                        className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${regErrors.phone ? inputErrorClass : inputOkClass}`}
                      />
                      {regErrors.phone ? <p className="mt-1 text-xs text-red-600">{regErrors.phone}</p> : null}
                    </div>

                    <div>
                      <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="registerEmail">
                        Email
                      </label>
                      <input
                        id="registerEmail"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${regErrors.email ? inputErrorClass : inputOkClass}`}
                      />
                      {regErrors.email ? <p className="mt-1 text-xs text-red-600">{regErrors.email}</p> : null}
                    </div>

                    <div>
                      <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="registerPassword">
                        Password
                      </label>
                      <input
                        id="registerPassword"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Enter password"
                        className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${regErrors.password ? inputErrorClass : inputOkClass}`}
                      />
                      {regErrors.password ? <p className="mt-1 text-xs text-red-600">{regErrors.password}</p> : null}
                    </div>

                    <button
                      type="submit"
                      disabled={regSubmitting}
                      className={`${btnPrimary} py-2 text-sm disabled:opacity-60`}
                    >
                      {regSubmitting ? 'Saving…' : 'Create Account'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-center font-serif text-3xl font-semibold text-[#354A3F]">Login</h2>
                  <p className="mt-2 text-center text-xs text-[#5a5a5a] sm:text-sm">
                    Administrator login — use the admin email and password from your server config.
                  </p>
                  {loginApiError ? (
                    <p className="mt-2 text-center text-sm text-red-600">{loginApiError}</p>
                  ) : null}
                  <div className="mt-2 text-center text-sm text-[#5a5a5a]">
                    <span>New user? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegApiError('');
                        setLoginApiError('');
                        setShowRegister(true);
                      }}
                      className={linkClass}
                    >
                      Register
                    </button>
                  </div>

                  <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit} noValidate>
                    <div>
                      <label className={labelClass} htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`mt-1.5 w-full rounded-2xl border bg-[#FAFAF8] px-4 py-2.5 text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${loginErrors.email ? inputErrorClass : inputOkClass}`}
                      />
                      {loginErrors.email ? <p className="mt-1 text-xs text-red-600">{loginErrors.email}</p> : null}
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="password">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className={`mt-1.5 w-full rounded-2xl border bg-[#FAFAF8] px-4 py-2.5 text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${loginErrors.password ? inputErrorClass : inputOkClass}`}
                      />
                      {loginErrors.password ? <p className="mt-1 text-xs text-red-600">{loginErrors.password}</p> : null}
                    </div>

                    <button
                      type="submit"
                      disabled={loginSubmitting}
                      className={`${btnPrimary} disabled:opacity-60`}
                    >
                      {loginSubmitting ? 'Signing in…' : 'Login'}
                    </button>

                    <div className="text-left">
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-[#354A3F]/80 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LandingLeafIcon from '../components/LandingLeafIcon';
import food1 from '../../../assets/riceandcurry1.png';
import food2 from '../../../assets/lunchbox.png';
import food3 from '../../../assets/yellowRice.png';
import food4 from '../../../assets/rice and curry.jpg';

const MENU_IMAGES = [food1, food2, food3, food4];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerType, setRegisterType] = useState('customer');

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

  const clearFieldError = (field) => {
    setRegErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegErrors({});
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
      window.alert(data.message || 'Your account has been submitted for review.');
      navigate('/login', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || err.message || 'Registration failed.';
      const field = data?.field;
      if (field && typeof field === 'string') {
        setRegErrors({ [field]: msg });
        setRegApiError('');
      } else {
        setRegErrors({});
        setRegApiError(msg);
      }
    } finally {
      setRegSubmitting(false);
    }
  };

  const inputErrorClass = 'border-red-400 focus:ring-red-100';
  const inputOkClass = 'border-black/15 focus:border-[#0B8E3A] focus:ring-2 focus:ring-[#0B8E3A]/20';

  const labelClass = 'text-sm font-semibold text-black';
  const linkClass = 'font-semibold text-black underline-offset-2 hover:underline';
  const btnPrimary =
    'w-full rounded-full bg-[#0B8E3A] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#087532] hover:shadow-lg';

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black">
              <LandingLeafIcon className="h-5 w-5" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-black">UNI EATS</span>
          </Link>
          <Link to="/" className="text-base font-semibold text-black transition hover:opacity-80">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute left-4 top-24 text-black/[0.06] md:left-12">
          <LandingLeafIcon className="h-24 w-24" />
        </div>
        <div className="pointer-events-none absolute bottom-20 right-8 rotate-12 text-black/[0.06]">
          <LandingLeafIcon className="h-20 w-20" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-5 md:grid-cols-2 md:items-start md:gap-16 md:px-8 md:py-8 lg:py-10">
          <div className="order-2 mt-2 md:order-2 md:-translate-y-3 md:self-start lg:-translate-y-5">
            <p className="text-sm font-medium uppercase tracking-widest text-black/70">Join the community</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-black md:mt-3 md:text-5xl">
              Create your account
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black md:mt-5">
              Register as a student or staff member. Fresh meals, simple access — one place for campus students.
            </p>
            <div className="mt-6 hidden h-px max-w-xs bg-gradient-to-r from-black/20 to-transparent md:block" />

            <div className="relative mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-black/10 bg-white py-3 shadow-sm md:mt-7">
              <div className="login-marquee-track">
                {[...MENU_IMAGES, ...MENU_IMAGES].map((src, i) => (
                  <img
                    key={`${i}-${src}`}
                    src={src}
                    alt=""
                    className="h-[72px] w-[104px] shrink-0 rounded-xl border border-black/10 object-cover shadow-sm md:h-[88px] md:w-[120px]"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 mt-1.5 md:order-1 md:mt-2 md:self-start">
            <div className="mx-auto w-full max-w-sm rounded-[24px] border border-black/10 bg-white px-4 pb-4 pt-1.5 shadow-xl shadow-black/10 sm:max-w-[380px] sm:px-5 sm:pb-4 sm:pt-2 md:px-5 md:pb-5">
              <h2 className="mt-0 text-center font-serif text-2xl font-semibold leading-tight text-black md:text-3xl">
                Register
              </h2>
              {regApiError ? (
                <p className="mt-2 text-center text-xs text-red-600 sm:text-sm">{regApiError}</p>
              ) : null}
              <div className="mt-1 text-center text-[11px] text-black sm:text-xs">
                <span>Already have an account? </span>
                <Link to="/login" className={linkClass}>
                  Login
                </Link>
              </div>
              <div className="mt-1 text-center">
                {registerType === 'customer' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterType('staff');
                      setRegErrors({});
                      setRegApiError('');
                    }}
                    className="text-[10px] font-medium leading-tight text-black hover:underline sm:text-[11px]"
                  >
                    Register as staff? Click here
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterType('customer');
                      setRegErrors({});
                      setRegApiError('');
                    }}
                    className="text-[10px] font-medium leading-tight text-black hover:underline sm:text-[11px]"
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
                    onChange={(e) => {
                      setRegFullName(e.target.value);
                      clearFieldError('fullName');
                    }}
                    placeholder="e.g. Senuri Perera (first and last)"
                    className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-black outline-none transition placeholder:text-black/40 ${regErrors.fullName ? inputErrorClass : inputOkClass}`}
                  />
                  {regErrors.fullName ? (
                    <p className="mt-1 text-xs text-red-600">{regErrors.fullName}</p>
                  ) : null}
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
                        onChange={(e) => {
                          setRegStudentId(e.target.value);
                          clearFieldError('studentId');
                        }}
                        maxLength={10}
                        placeholder="e.g. IT23419314"
                        className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-black outline-none transition placeholder:text-black/40 ${regErrors.studentId ? inputErrorClass : inputOkClass}`}
                      />
                      {regErrors.studentId ? (
                        <p className="mt-1 text-xs text-red-600">{regErrors.studentId}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="studentIdPhoto">
                        Student ID Photo Upload
                      </label>
                      <input
                        id="studentIdPhoto"
                        type="file"
                        accept="image/*"
                        className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-2 text-xs text-black outline-none file:mr-2 file:rounded-lg file:border-0 file:bg-neutral-200 file:px-2 file:py-1 file:text-xs file:font-medium file:text-black sm:text-sm sm:file:px-3 sm:file:py-1.5 sm:file:text-sm ${regErrors.studentPhoto ? inputErrorClass : inputOkClass}`}
                        onChange={(e) => {
                          setRegStudentPhoto(e.target.files && e.target.files[0] ? e.target.files[0] : null);
                          clearFieldError('studentPhoto');
                        }}
                      />
                      {regErrors.studentPhoto ? (
                        <p className="mt-1 text-xs text-red-600">{regErrors.studentPhoto}</p>
                      ) : null}
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
                          className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-black outline-none ${inputOkClass}`}
                        >
                          <option value="Delivery Manager">Delivery Manager</option>
                          <option value="Order Manager">Order Manager</option>
                          <option value="Food Menu Manager">Food Menu Manager</option>
                        </select>
                  </div>
                )}

                <div>
                  <label className={`${labelClass} text-xs sm:text-sm`} htmlFor="phoneNumber">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => {
                      setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      clearFieldError('phone');
                    }}
                    placeholder="0712345678"
                    className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-black outline-none transition placeholder:text-black/40 ${regErrors.phone ? inputErrorClass : inputOkClass}`}
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
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    placeholder="name@example.com"
                    className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-black outline-none transition placeholder:text-black/40 ${regErrors.email ? inputErrorClass : inputOkClass}`}
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
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    placeholder="Enter password"
                    className={`mt-1 w-full rounded-xl border bg-[#FAFAF8] px-3 py-1.5 text-sm text-black outline-none transition placeholder:text-black/40 ${regErrors.password ? inputErrorClass : inputOkClass}`}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

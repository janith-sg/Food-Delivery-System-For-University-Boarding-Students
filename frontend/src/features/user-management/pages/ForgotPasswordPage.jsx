import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isValidEmail } from '../utils/formValidation';

function LeafIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  );
}

const inputErrorClass = 'border-red-400 focus:ring-red-100';
const inputOkClass = 'border-[#354A3F]/20 focus:border-[#354A3F] focus:ring-2 focus:ring-[#354A3F]/15';
const labelClass = 'text-sm font-semibold text-[#354A3F]';
const linkClass = 'font-semibold text-[#354A3F] underline-offset-2 hover:underline';
const btnPrimary =
  'w-full rounded-full bg-[#354A3F] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#2B3D32] hover:shadow-lg';

/**
 * Forgot password — enter email to receive a reset code (UI only; wire to API later).
 */
function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setSubmittedEmail(email.trim());
    setStep('code');
    setCode('');
    setCodeError('');
    // Hook: POST /auth/forgot-password { email }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) {
      setCodeError('Enter the 6-digit code from your email.');
      return;
    }
    setCodeError('');
    window.alert('Code verified (UI only — connect your backend to reset the password).');
    // Hook: POST /auth/verify-reset-code { email, code }
  };

  const handleResend = () => {
    window.alert(`A new code would be sent to ${submittedEmail} (UI only).`);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2B2B2B]">
      <header className="border-b border-[#354A3F]/10 bg-[#F7F5F0]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#354A3F]/15 text-[#354A3F]">
              <LeafIcon className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-[#354A3F]">UNI EATS</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-[#354A3F]/80 transition hover:text-[#354A3F]">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="relative overflow-hidden">
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

        <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-5 py-10 md:px-8 md:py-14">
          <div className="w-full max-w-md">
            <div className="rounded-[24px] border border-white/80 bg-white p-8 shadow-xl shadow-[#354A3F]/10 md:p-10">
              {step === 'email' ? (
                <>
                  <h1 className="text-center font-serif text-2xl font-semibold text-[#354A3F] md:text-3xl">
                    Forgot your password?
                  </h1>
                  <p className="mt-3 text-center text-sm leading-relaxed text-[#5a5a5a]">
                    Enter the email for your account. We&apos;ll send you a verification code to reset your password.
                  </p>

                  <form className="mt-8 space-y-5" onSubmit={handleSendCode} noValidate>
                    <div>
                      <label className={labelClass} htmlFor="forgot-email">
                        Email
                      </label>
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="name@example.com"
                        className={`mt-1.5 w-full rounded-2xl border bg-[#FAFAF8] px-4 py-2.5 text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/40 ${emailError ? inputErrorClass : inputOkClass}`}
                      />
                      {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
                    </div>

                    <button type="submit" className={btnPrimary}>
                      Send verification code
                    </button>
                  </form>

                  <p className="mt-8 text-center text-sm text-[#5a5a5a]">
                    Remember your password?{' '}
                    <Link to="/login" className={linkClass}>
                      Back to login
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-center font-serif text-2xl font-semibold text-[#354A3F] md:text-3xl">
                    Enter verification code
                  </h1>
                  <p className="mt-3 text-center text-sm leading-relaxed text-[#5a5a5a]">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-[#2B2B2B]">{submittedEmail}</span>. Check your inbox (and spam
                    folder).
                  </p>

                  <form className="mt-8 space-y-5" onSubmit={handleVerifyCode} noValidate>
                    <div>
                      <label className={labelClass} htmlFor="reset-code">
                        Verification code
                      </label>
                      <input
                        id="reset-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={code}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setCode(v);
                          if (codeError) setCodeError('');
                        }}
                        placeholder="000000"
                        className={`mt-1.5 w-full rounded-2xl border bg-[#FAFAF8] px-4 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-[#2B2B2B] outline-none transition placeholder:text-[#354A3F]/30 ${codeError ? inputErrorClass : inputOkClass}`}
                      />
                      {codeError ? <p className="mt-1 text-xs text-red-600">{codeError}</p> : null}
                    </div>

                    <button type="submit" className={btnPrimary}>
                      Verify &amp; continue
                    </button>
                  </form>

                  <div className="mt-6 flex flex-col gap-3 text-center text-sm sm:flex-row sm:justify-center sm:gap-6">
                    <button type="button" onClick={handleResend} className="font-medium text-[#354A3F]/90 hover:underline">
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setCodeError('');
                      }}
                      className="font-medium text-[#5a5a5a] hover:text-[#2B2B2B] hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>

                  <p className="mt-8 text-center text-sm text-[#5a5a5a]">
                    <Link to="/login" className={linkClass}>
                      Back to login
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

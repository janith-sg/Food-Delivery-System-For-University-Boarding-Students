import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingLeafIcon from '../components/LandingLeafIcon';

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputErrorClass = 'border-red-400 focus:ring-red-100';
const inputOkClass = 'border-black/15 focus:border-[#0B8E3A] focus:ring-2 focus:ring-[#0B8E3A]/20';
const labelClass = 'text-sm font-semibold text-black';
const linkClass = 'font-semibold text-black underline-offset-2 hover:underline';
const btnPrimary =
  'w-full rounded-full bg-[#0B8E3A] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#087532] hover:shadow-lg';

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
    if (!EMAIL_OK.test(email.trim())) {
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
  };

  const handleResend = () => {
    window.alert(`A new code would be sent to ${submittedEmail} (UI only).`);
  };

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

        <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-5 py-10 md:px-8 md:py-14">
          <div className="w-full max-w-md">
            <div className="rounded-[24px] border border-black/10 bg-white p-8 shadow-xl shadow-black/10 md:p-10">
              {step === 'email' ? (
                <>
                  <h1 className="text-center font-serif text-2xl font-semibold text-black md:text-3xl">
                    Forgot your password?
                  </h1>
                  <p className="mt-3 text-center text-sm leading-relaxed text-black">
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
                        className={`mt-1.5 w-full rounded-2xl border bg-[#FAFAF8] px-4 py-2.5 text-black outline-none transition placeholder:text-black/40 ${emailError ? inputErrorClass : inputOkClass}`}
                      />
                      {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
                    </div>

                    <button type="submit" className={btnPrimary}>
                      Send verification code
                    </button>
                  </form>

                  <p className="mt-8 text-center text-sm text-black">
                    Remember your password?{' '}
                    <Link to="/login" className={linkClass}>
                      Back to login
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-center font-serif text-2xl font-semibold text-black md:text-3xl">
                    Enter verification code
                  </h1>
                  <p className="mt-3 text-center text-sm leading-relaxed text-black">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-black">{submittedEmail}</span>. Check your inbox (and spam
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
                        className={`mt-1.5 w-full rounded-2xl border bg-[#FAFAF8] px-4 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-black outline-none transition placeholder:text-black/30 ${codeError ? inputErrorClass : inputOkClass}`}
                      />
                      {codeError ? <p className="mt-1 text-xs text-red-600">{codeError}</p> : null}
                    </div>

                    <button type="submit" className={btnPrimary}>
                      Verify &amp; continue
                    </button>
                  </form>

                  <div className="mt-6 flex flex-col gap-3 text-center text-sm sm:flex-row sm:justify-center sm:gap-6">
                    <button type="button" onClick={handleResend} className="font-medium text-black hover:underline">
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setCodeError('');
                      }}
                      className="font-medium text-black hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>

                  <p className="mt-8 text-center text-sm text-black">
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

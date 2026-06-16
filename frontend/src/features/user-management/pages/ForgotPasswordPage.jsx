import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LandingLeafIcon from '../components/LandingLeafIcon';
import FeedbackModal from '../components/FeedbackModal';
import { useFeedbackModal } from '../hooks/useFeedbackModal';

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputErrorClass = 'border-red-400 focus:border-red-400 focus:ring-red-100';
const inputOkClass =
  'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';
const labelClass = 'text-sm font-semibold text-slate-700';
const linkClass = 'font-semibold text-emerald-700 underline-offset-2 hover:underline';
const btnPrimary =
  'w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
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

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setApiError('');
    setSending(true);
    try {
      const mail = email.trim();
      await axios.post('/api/password-reset/request', { email: mail });
      setSubmittedEmail(mail);
      setStep('code');
      setCode('');
      setCodeError('');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || err.message || 'Could not send code.';
      const field = data?.field;
      if (field === 'email') setEmailError(msg);
      else setApiError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) {
      setCodeError('Enter the 6-digit code from your email.');
      return;
    }
    setApiError('');
    setVerifying(true);
    try {
      await axios.post('/api/password-reset/verify', { email: submittedEmail, code: digits });
      setCodeError('');
      setStep('reset');
      setNewPassword('');
      setPasswordError('');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || err.message || 'Verification failed.';
      const field = data?.field;
      if (field === 'code') setCodeError(msg);
      else if (field === 'email') setEmailError(msg);
      else setApiError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setApiError('');
    setSending(true);
    try {
      await axios.post('/api/password-reset/request', { email: submittedEmail });
    } catch (err) {
      const data = err.response?.data;
      setApiError(data?.message || err.message || 'Could not resend code.');
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setApiError('');
    if (!newPassword.trim()) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setResetting(true);
    try {
      await axios.post('/api/password-reset/reset', {
        email: submittedEmail,
        code,
        newPassword,
      });
      showFeedback('success', 'Success', 'Password updated. Please log in.');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || err.message || 'Reset failed.';
      const field = data?.field;
      if (field === 'newPassword') setPasswordError(msg);
      else if (field === 'code') setCodeError(msg);
      else if (field === 'email') setEmailError(msg);
      else setApiError(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-surface font-sans text-slate-900 antialiased">
      <FeedbackModal
        open={Boolean(feedback)}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={() => {
          dismissFeedback();
          navigate('/login');
        }}
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <LandingLeafIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">UNI EATS</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="relative overflow-hidden bg-admin-surface">
        <div className="pointer-events-none absolute left-4 top-24 text-slate-200/80 md:left-12">
          <LandingLeafIcon className="h-24 w-24" />
        </div>
        <div className="pointer-events-none absolute bottom-20 right-8 rotate-12 text-slate-200/80">
          <LandingLeafIcon className="h-20 w-20" />
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-5 py-10 md:px-8 md:py-14">
          <div className="w-full max-w-md">
            <div className="rounded-xl border border-slate-200/90 bg-white p-8 shadow-sm md:p-10">
              {step === 'email' ? (
                <>
                  <h1 className="text-center text-2xl font-semibold text-slate-900 md:text-3xl">
                    Forgot your password?
                  </h1>
                  <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
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
                        className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 ${emailError ? inputErrorClass : inputOkClass}`}
                      />
                      {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
                    </div>
                    {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}

                    <button type="submit" className={btnPrimary}>
                      {sending ? 'Sending…' : 'Send verification code'}
                    </button>
                  </form>

                  <p className="mt-8 text-center text-sm text-slate-600">
                    Remember your password?{' '}
                    <Link to="/login" className={linkClass}>
                      Back to login
                    </Link>
                  </p>
                </>
              ) : step === 'code' ? (
                <>
                  <h1 className="text-center text-2xl font-semibold text-slate-900 md:text-3xl">
                    Enter verification code
                  </h1>
                  <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-slate-900">{submittedEmail}</span>. Check your inbox (and spam
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
                        className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-slate-900 outline-none transition placeholder:text-slate-400 ${codeError ? inputErrorClass : inputOkClass}`}
                      />
                      {codeError ? <p className="mt-1 text-xs text-red-600">{codeError}</p> : null}
                    </div>
                    {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}

                    <button type="submit" className={btnPrimary}>
                      {verifying ? 'Verifying…' : 'Verify & continue'}
                    </button>
                  </form>

                  <div className="mt-6 flex flex-col gap-3 text-center text-sm sm:flex-row sm:justify-center sm:gap-6">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={sending}
                      className="font-medium text-slate-600 hover:text-emerald-700 hover:underline disabled:opacity-60"
                    >
                      {sending ? 'Resending…' : 'Resend code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setCodeError('');
                        setNewPassword('');
                        setPasswordError('');
                        setApiError('');
                      }}
                      className="font-medium text-slate-600 hover:text-emerald-700 hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>

                  <p className="mt-8 text-center text-sm text-slate-600">
                    <Link to="/login" className={linkClass}>
                      Back to login
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-center text-2xl font-semibold text-slate-900 md:text-3xl">
                    Set a new password
                  </h1>
                  <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                    Enter a new password for <span className="font-medium text-slate-900">{submittedEmail}</span>.
                  </p>

                  <form className="mt-8 space-y-5" onSubmit={handleResetPassword} noValidate>
                    <div>
                      <label className={labelClass} htmlFor="new-password">
                        New password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder="Enter new password"
                        className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 ${passwordError ? inputErrorClass : inputOkClass}`}
                      />
                      {passwordError ? <p className="mt-1 text-xs text-red-600">{passwordError}</p> : null}
                    </div>
                    {apiError ? <p className="text-sm text-red-600">{apiError}</p> : null}

                    <button type="submit" className={btnPrimary}>
                      {resetting ? 'Updating…' : 'Update password'}
                    </button>
                  </form>

                  <p className="mt-8 text-center text-sm text-slate-600">
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

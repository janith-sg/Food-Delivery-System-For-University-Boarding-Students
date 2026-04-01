import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getToken, getUser, setAuth } from '../../../../lib/auth';
import LandingLeafIcon from '../../components/LandingLeafIcon';
import idPhoto1 from '../../mock/r1.png';

function digitsOnlyMax10(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

function initialProfileForm() {
  const u = getUser();
  if (!u) {
    return { name: '', phone: '', email: '', photo: idPhoto1 };
  }
  let photo = idPhoto1;
  const raw = u.studentPhotoUrl || u.photoUrl;
  if (typeof raw === 'string' && raw.trim()) {
    photo = raw.trim();
  }
  return {
    name: (u.fullName && String(u.fullName).trim()) || '',
    phone: u.phone ? digitsOnlyMax10(String(u.phone)) : '',
    email: (u.email && String(u.email).trim()) || '',
    photo,
  };
}

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [profileErrors, setProfileErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  const inputBase =
    'mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm font-normal text-black outline-none transition placeholder:font-normal placeholder:text-black/45 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15';
  const labelClass = 'text-xs font-normal uppercase tracking-wide text-black';

  const handleSave = async () => {
    const u = getUser();
    if (!u?.id) {
      setApiError('No signed-in user found. Please log in again.');
      return;
    }

    setApiError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('fullName', profileForm.name);
      fd.append('email', profileForm.email);
      fd.append('phone', profileForm.phone);
      if (photoFile) fd.append('profilePhoto', photoFile);

      const { data } = await axios.patch(`/api/users/${u.id}/profile`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = data?.user;
      if (updatedUser) {
        setAuth(getToken(), updatedUser);
      }
      setPhotoFile(null);
      window.alert(data?.message || 'Profile updated.');
    } catch (e) {
      const data = e.response?.data;
      const msg = data?.message || e.message || 'Could not update profile.';
      const field = data?.field;
      if (field) {
        const mapped = field === 'fullName' ? 'name' : field;
        setProfileErrors((prev) => ({ ...prev, [mapped]: msg }));
      } else {
        setApiError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-normal text-black">
      <header className="sticky top-0 z-50 border-b border-[#bbf7d0]/50 bg-gradient-to-r from-[#f0fdf4]/95 to-[#eff6ff]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          <Link to="/" className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16a34a]/15 text-black">
              <LandingLeafIcon className="h-5 w-5" />
            </div>
            <span className="font-sans text-lg font-normal tracking-tight text-black md:text-xl">UNI EATS</span>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <Link
              to="/admin/dashboard"
              className="hidden text-xs font-normal text-black/90 underline-offset-4 transition hover:text-black hover:underline sm:inline"
            >
              Admin dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                clearAuth();
                navigate('/login');
              }}
              className="rounded-full border border-[#16a34a]/20 bg-white px-3 py-1.5 text-xs font-normal text-black shadow-sm transition hover:bg-[#ecfdf5]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 -z-10 min-h-[200px]"
          style={{
            background: 'linear-gradient(168deg, #d1fae5 0%, #ecfdf5 38%, #dbeafe 38%, #f8fafc 100%)',
          }}
        />
        <div className="pointer-events-none absolute left-3 top-4 h-14 w-14 text-black/10 md:left-8">
          <LandingLeafIcon className="h-full w-full" />
        </div>

        <main className="relative mx-auto max-w-lg px-4 pb-10 pt-5 md:px-6 md:pt-7">
          <Link
            to="/admin/dashboard"
            className="mb-3 inline-flex text-xs font-normal text-black/90 underline-offset-4 transition hover:text-black hover:underline sm:hidden"
          >
            ← Admin dashboard
          </Link>

          <section className="rounded-xl border border-[#bbf7d0]/60 bg-gradient-to-br from-white/98 to-[#eff6ff]/30 p-4 shadow-lg backdrop-blur md:p-5">
            <h1 className="text-center font-sans text-xl leading-tight tracking-wide font-normal text-black md:text-2xl">
              YOUR PROFILE
            </h1>
            {apiError ? <p className="mt-3 text-center text-sm text-red-600">{apiError}</p> : null}
            <form className="mt-5 space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#86efac]/50 to-[#93c5fd]/40 blur-sm" />
                  <img
                    src={profileForm.photo}
                    alt="Profile"
                    className="relative h-16 w-16 rounded-full border-2 border-white object-cover shadow"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className={`${labelClass} block`} htmlFor="profilePhoto">
                    Profile photo
                  </label>
                  <input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    className={`mt-1 block w-full max-w-md text-xs font-normal text-black file:mr-2 file:rounded-full file:border-0 file:bg-[#16a34a] file:px-3 file:py-1.5 file:text-xs file:font-normal file:text-white hover:file:bg-[#15803d] ${
                      profileErrors.photo ? 'ring-2 ring-red-400 rounded-lg' : ''
                    }`}
                    onChange={(e) => {
                      const selectedFile = e.target.files && e.target.files[0];
                      if (!selectedFile) return;
                      const previewUrl = URL.createObjectURL(selectedFile);
                      setProfileForm((prev) => ({ ...prev, photo: previewUrl }));
                      setPhotoFile(selectedFile);
                      setProfileErrors((prev) => ({ ...prev, photo: undefined }));
                    }}
                  />
                  {profileErrors.photo ? <p className="mt-1 text-xs text-red-600">{profileErrors.photo}</p> : null}
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="profileName">
                  Full name
                </label>
                <input
                  id="profileName"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => {
                    setProfileForm((prev) => ({ ...prev, name: e.target.value }));
                    setProfileErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`${inputBase} ${profileErrors.name ? 'border-red-500 ring-red-100' : 'border-[#bbf7d0]'}`}
                />
                {profileErrors.name ? <p className="mt-1 text-xs text-red-600">{profileErrors.name}</p> : null}
              </div>

              <div>
                <label className={labelClass} htmlFor="profilePhone">
                  Phone number
                </label>
                <input
                  id="profilePhone"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={profileForm.phone}
                  onChange={(e) => {
                    setProfileForm((prev) => ({ ...prev, phone: digitsOnlyMax10(e.target.value) }));
                    setProfileErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="0712345678"
                  className={`${inputBase} ${profileErrors.phone ? 'border-red-500 ring-red-100' : 'border-[#bbf7d0]'}`}
                />
                {profileErrors.phone ? <p className="mt-1 text-xs text-red-600">{profileErrors.phone}</p> : null}
              </div>

              <div>
                <label className={labelClass} htmlFor="profileEmail">
                  Email
                </label>
                <input
                  id="profileEmail"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => {
                    setProfileForm((prev) => ({ ...prev, email: e.target.value }));
                    setProfileErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`${inputBase} ${profileErrors.email ? 'border-red-500 ring-red-100' : 'border-[#bbf7d0]'}`}
                />
                {profileErrors.email ? <p className="mt-1 text-xs text-red-600">{profileErrors.email}</p> : null}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a] px-5 py-2 text-xs font-normal text-white shadow-md transition hover:bg-[#15803d] md:text-sm"
                >
                  {saving ? 'Saving…' : 'Save profile'}
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <Link
                  to="/"
                  className="text-xs font-normal text-black/90 underline-offset-4 transition hover:text-black hover:underline md:text-sm"
                >
                  Back to home
                </Link>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

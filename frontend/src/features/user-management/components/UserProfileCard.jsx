import React, { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Camera, Check, Lock, Pencil, Trash2, X } from 'lucide-react';
import { getToken, getUser, setAuth } from '../../../lib/auth';
import idPhoto1 from '../mock/r1.png';
import FeedbackModal from './FeedbackModal';
import { useFeedbackModal } from '../hooks/useFeedbackModal';

function digitsOnlyMax10(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

function joinFullName(firstName, lastName) {
  return `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
}

function profilePhotoSrc(photo) {
  if (typeof photo !== 'string' || !photo.trim()) return '';
  const t = photo.trim();
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('blob:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function formatUsDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function buildFormFromUser(u) {
  if (!u) {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      photo: idPhoto1,
    };
  }
  const { firstName, lastName } = splitFullName(u.fullName);
  let photo = idPhoto1;
  const raw = u.studentPhotoUrl || u.photoUrl;
  if (typeof raw === 'string' && raw.trim()) {
    photo = raw.trim();
  }
  return {
    firstName,
    lastName,
    phone: u.phone ? digitsOnlyMax10(String(u.phone)) : '',
    email: (u.email && String(u.email).trim()) || '',
    photo,
  };
}

const fieldLabel = 'text-xs font-bold uppercase tracking-wide text-slate-500';
const fieldValue = 'mt-1 text-sm text-admin-ink';
const inputClass =
  'mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20';

/**
 * Self-contained profile view/edit UI in a card shell. Use inside a page, modal, or panel.
 * @param {{ className?: string }} props
 */
export function UserProfileCard({ className = '' }) {
  const fileInputRef = useRef(null);
  const user = getUser();
  const { feedback, dismissFeedback, showFeedback } = useFeedbackModal();

  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState(() => buildFormFromUser(getUser()));
  const [profileErrors, setProfileErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const joinedAt = formatUsDate(user?.createdAt);
  const updatedAt = formatUsDate(user?.updatedAt);
  const emailVerified = Boolean(user?.emailVerified);
  const phoneVerified = Boolean(user?.phoneVerified);

  const resetFormFromSession = useCallback(() => {
    setProfileForm(buildFormFromUser(getUser()));
    setPhotoFile(null);
    setPhotoRemoved(false);
    setProfileErrors({});
    setApiError('');
  }, []);

  const cancelEdit = () => {
    resetFormFromSession();
    setEditing(false);
  };

  const handleSave = async () => {
    const u = getUser();
    const userId = u?.id ?? u?._id;
    if (!userId) {
      setApiError('No signed-in user found. Please log in again.');
      return;
    }

    const fullName = joinFullName(profileForm.firstName, profileForm.lastName);
    setApiError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('fullName', fullName);
      fd.append('email', profileForm.email);
      fd.append('phone', profileForm.phone);
      if (photoRemoved && !photoFile) {
        fd.append('clearPhoto', 'true');
      }
      if (photoFile) fd.append('profilePhoto', photoFile);

      const { data } = await axios.patch(`/api/users/${userId}/profile`, fd);
      const updatedUser = data?.user;
      if (updatedUser) {
        setAuth(getToken(), updatedUser);
        const next = buildFormFromUser(updatedUser);
        const saved = String(updatedUser.studentPhotoUrl || '').trim();
        if (saved) {
          const path = saved.startsWith('/') ? saved : `/${saved}`;
          next.photo = `${path}?v=${Date.now()}`;
        }
        setProfileForm(next);
        setPhotoFile(null);
        setPhotoRemoved(false);
        setEditing(false);
      }
      showFeedback('success', 'Success', data?.message || 'Profile updated.');
    } catch (e) {
      const resData = e.response?.data;
      const msg = resData?.message || e.message || 'Could not update profile.';
      const field = resData?.field;
      if (field) {
        const mapped = field === 'fullName' ? 'firstName' : field;
        setProfileErrors((prev) => ({ ...prev, [mapped]: msg }));
      } else {
        setApiError('');
        showFeedback('error', 'Could not update', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const displayPhotoSrc = profilePhotoSrc(profileForm.photo) || idPhoto1;

  return (
    <div
      className={`w-full max-h-[min(calc(100dvh-5.5rem),42rem)] overflow-y-auto overscroll-contain rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm md:p-6 ${className}`.trim()}
    >
      <FeedbackModal
        open={Boolean(feedback)}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
        onClose={dismissFeedback}
      />

      {apiError ? (
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">{apiError}</p>
      ) : null}

      <div className="mt-4 flex flex-col items-center">
        <div className="relative h-28 w-28 shrink-0">
          <img
            src={displayPhotoSrc}
            alt=""
            className="h-full w-full rounded-full border border-slate-200 object-cover"
          />
          <button
            type="button"
            aria-label="Remove profile photo"
            onClick={() => {
              setProfileForm((prev) => ({ ...prev, photo: idPhoto1 }));
              setPhotoFile(null);
              setPhotoRemoved(true);
              setEditing(true);
            }}
            className="absolute bottom-0 left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-red-500 text-white shadow-md transition hover:bg-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Change profile photo"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const previewUrl = URL.createObjectURL(f);
              setProfileForm((prev) => ({ ...prev, photo: previewUrl }));
              setPhotoFile(f);
              setPhotoRemoved(false);
              setEditing(true);
              setProfileErrors((prev) => ({ ...prev, photo: undefined }));
              e.target.value = '';
            }}
          />
        </div>
        <p className="mt-3 max-w-sm text-center text-xs text-admin-ink/80">
          Camera to change photo · Trash to remove
        </p>
      </div>

      {!editing ? (
        <>
          <div className="mt-5 grid w-full grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className={fieldLabel}>First Name</p>
                <p className={fieldValue}>{profileForm.firstName || '—'}</p>
              </div>
              <div>
                <p className={fieldLabel}>Last Name</p>
                <p className={fieldValue}>{profileForm.lastName || '—'}</p>
              </div>
              <div>
                <p className={fieldLabel}>Email</p>
                <p className={`${fieldValue} flex flex-wrap items-center gap-2`}>
                  <span className="break-all">{profileForm.email || '—'}</span>
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-600">
                      <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                      <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                      Not verified
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className={fieldLabel}>Phone</p>
                <p className={`${fieldValue} flex flex-wrap items-center gap-2`}>
                  <span>{profileForm.phone || '—'}</span>
                  {phoneVerified ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-600">
                      <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                      <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                      Not verified
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className={fieldLabel}>Joined Date</p>
                <p className={fieldValue}>{joinedAt}</p>
              </div>
              <div>
                <p className={fieldLabel}>Profile Updated</p>
                <p className={fieldValue}>{updatedAt}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                resetFormFromSession();
                setEditing(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border-0 bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit profile
            </button>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
            >
              <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-700" strokeWidth={2} />
              Change password
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className={fieldLabel} htmlFor="profile-firstName">
                First Name
              </label>
              <input
                id="profile-firstName"
                type="text"
                value={profileForm.firstName}
                onChange={(e) => {
                  setProfileForm((p) => ({ ...p, firstName: e.target.value }));
                  setProfileErrors((er) => ({ ...er, firstName: undefined, lastName: undefined }));
                }}
                className={inputClass}
              />
              {profileErrors.firstName ? (
                <p className="mt-0.5 text-xs text-red-600">{profileErrors.firstName}</p>
              ) : null}
            </div>
            <div>
              <label className={fieldLabel} htmlFor="profile-lastName">
                Last Name
              </label>
              <input
                id="profile-lastName"
                type="text"
                value={profileForm.lastName}
                onChange={(e) => {
                  setProfileForm((p) => ({ ...p, lastName: e.target.value }));
                  setProfileErrors((er) => ({ ...er, firstName: undefined, lastName: undefined }));
                }}
                className={inputClass}
              />
              {profileErrors.lastName ? (
                <p className="mt-0.5 text-xs text-red-600">{profileErrors.lastName}</p>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label className={fieldLabel} htmlFor="profile-email">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => {
                  setProfileForm((p) => ({ ...p, email: e.target.value }));
                  setProfileErrors((er) => ({ ...er, email: undefined }));
                }}
                className={inputClass}
              />
              {profileErrors.email ? (
                <p className="mt-0.5 text-xs text-red-600">{profileErrors.email}</p>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label className={fieldLabel} htmlFor="profile-phone">
                Phone
              </label>
              <input
                id="profile-phone"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={profileForm.phone}
                onChange={(e) => {
                  setProfileForm((p) => ({ ...p, phone: digitsOnlyMax10(e.target.value) }));
                  setProfileErrors((er) => ({ ...er, phone: undefined }));
                }}
                className={inputClass}
              />
              {profileErrors.phone ? (
                <p className="mt-0.5 text-xs text-red-600">{profileErrors.phone}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg border-0 bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-admin-ink hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfileCard;

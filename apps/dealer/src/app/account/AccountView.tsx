'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DealerWithRelations, SafeDealerUser, DealerUser } from '@trionyx/types';

interface AccountViewProps {
  dealer: DealerWithRelations;
  currentUser: SafeDealerUser;
  initialUsers: DealerUser[];
}

export function AccountView({ dealer, currentUser, initialUsers }: AccountViewProps) {
  // Contact Details View/Edit State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactPerson, setContactPerson] = useState(dealer.contactPerson || '');
  const [phone, setPhone] = useState(dealer.phone || '');
  const [alternatePhone, setAlternatePhone] = useState(dealer.alternatePhone || '');
  const [email, setEmail] = useState(dealer.email || '');
  const [addressLine1, setAddressLine1] = useState(dealer.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(dealer.addressLine2 || '');
  const [city, setCity] = useState(dealer.city || '');
  const [state, setState] = useState(dealer.state || '');
  const [postalCode, setPostalCode] = useState(dealer.postalCode || '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security Form State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await fetch('/api/v1/dealer/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactPerson,
          phone,
          alternatePhone: alternatePhone || null,
          email: email || null,
          addressLine1: addressLine1 || null,
          addressLine2: addressLine2 || null,
          city,
          state,
          postalCode: postalCode || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to update account details');
      }

      setProfileSuccess('Dealership contact and dispatch details updated successfully.');
      setIsEditingContact(false);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Could not save account details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/dealer/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 text-[#171714]">
      {/* 1. Header & Identity */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F]">
          <span>MY DEALERSHIP</span>
          <span>•</span>
          <span className="font-mono">{dealer.dealerCode}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            ACTIVE DEALER
          </span>
        </div>
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0 mt-1">
          {dealer.businessName}
        </h1>
        <p className="mt-1 text-[13.5px] text-[#68665F] m-0">
          Official dealership records, dispatch destination, authorized studio personnel, and credentials.
        </p>
      </div>

      {/* 2. Business Record (Official, Read-Only) */}
      <section aria-labelledby="business-record-heading" className="border-t border-[#171714]/10 pt-6 space-y-4">
        <div>
          <h2 id="business-record-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
            BUSINESS RECORD
          </h2>
          <p className="text-[12.5px] text-[#68665F] mt-0.5 m-0">
            Official commercial registration and distribution assignment certified by Trionyx.
          </p>
        </div>

        <div className="border border-[#171714]/10 rounded-[4px] bg-[#FCFBF7] p-5 divide-y divide-[#171714]/08">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pb-5 text-[13px]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                Legal Entity Name
              </span>
              <span className="font-medium text-[#171714] mt-1 block">
                {dealer.legalName || dealer.businessName}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                Dealer Code
              </span>
              <span className="font-mono font-medium text-[#171714] mt-1 block">
                {dealer.dealerCode}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                GSTIN / Tax ID
              </span>
              <span className="font-mono font-medium text-[#171714] mt-1 block">
                {dealer.gstin || 'Not registered / On file'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-5 text-[13px]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                Assigned Distributor
              </span>
              <span className="font-medium text-[#171714] mt-1 block">
                {dealer.distributor?.businessName || 'Trionyx Direct / Central Operations'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                Operating Territory
              </span>
              <span className="font-medium text-[#171714] mt-1 block">
                {dealer.city}, {dealer.state}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                Account Status
              </span>
              <span className="font-medium text-[#065F46] mt-1 block">
                Certified Dealership
              </span>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[#68665F] m-0">
          These official records are maintained by Trionyx Operations. To amend your registered entity name, GSTIN, or
          regional distributor assignment, please{' '}
          <Link href="/requests/new?type=SUPPORT" className="text-[#F26522] hover:underline font-medium">
            submit a dealership support request →
          </Link>
        </p>
      </section>

      {/* 3. Contact & Delivery (Editable) */}
      <section aria-labelledby="contact-heading" className="border-t border-[#171714]/10 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="contact-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
              CONTACT & DISPATCH DETAILS
            </h2>
            <p className="text-[12.5px] text-[#68665F] mt-0.5 m-0">
              Used for fulfillment communication, freight dispatches, and emergency operational contact.
            </p>
          </div>

          {!isEditingContact && (
            <button
              type="button"
              onClick={() => {
                setIsEditingContact(true);
                setProfileSuccess(null);
                setProfileError(null);
              }}
              className="px-3 py-1.5 rounded-[4px] border border-[#171714]/20 hover:border-[#171714] bg-white text-[12.5px] font-medium text-[#171714] transition-colors cursor-pointer"
            >
              Edit Contact Details
            </button>
          )}
        </div>

        {profileSuccess && (
          <div className="p-3 rounded-[4px] bg-[#ECFDF5] border border-[#A7F3D0] text-[13px] text-[#065F46]">
            ✓ {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="p-3 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C]">
            {profileError}
          </div>
        )}

        {!isEditingContact ? (
          /* View Mode */
          <div className="border border-[#171714]/10 rounded-[4px] bg-[#FCFBF7] p-5 divide-y divide-[#171714]/08">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pb-5 text-[13px]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                  Primary Contact
                </span>
                <span className="font-medium text-[#171714] mt-1 block">{contactPerson || '—'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                  Primary Phone
                </span>
                <span className="font-mono font-medium text-[#171714] mt-1 block">{phone || '—'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                  Alternate Phone
                </span>
                <span className="font-mono text-[#171714] mt-1 block">{alternatePhone || 'None'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                  Contact Email
                </span>
                <span className="font-mono text-[#171714] mt-1 block">{email || '—'}</span>
              </div>
            </div>

            <div className="pt-5 text-[13px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F] block">
                Dispatch / Studio Address
              </span>
              <p className="font-medium text-[#171714] mt-1 m-0">
                {[addressLine1, addressLine2, city, state, postalCode].filter(Boolean).join(', ') || 'No address registered'}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSaveProfile} className="border border-[#171714]/15 rounded-[4px] bg-[#FCFBF7] p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                  Primary Contact Person <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                  Phone Number <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                Premises / Street Address
              </label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Unit, Floor, Building or Street"
                className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                Area / Landmark
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Locality, Landmark or Industrial Estate"
                className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                  City <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                  State <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#171714]/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingContact(false)}
                className="px-4 py-2 rounded-[4px] text-[13px] font-medium text-[#68665F] hover:text-[#171714] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 rounded-[4px] bg-[#F26522] hover:bg-[#e05717] text-white text-[13px] font-semibold disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Save Contact Details'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 4. Portal Access & Studio Personnel */}
      <section aria-labelledby="portal-access-heading" className="border-t border-[#171714]/10 pt-6 space-y-4">
        <div>
          <h2 id="portal-access-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
            PORTAL ACCESS ({initialUsers.length} AUTHORIZED)
          </h2>
          <p className="text-[12.5px] text-[#68665F] mt-0.5 m-0">
            Personnel authorized to view availability, submit stock requests, and activate customer warranties.
          </p>
        </div>

        <div className="border border-[#171714]/10 rounded-[4px] bg-[#FCFBF7] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#171714]/10 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] bg-[#171714]/[0.02]">
                <th className="py-2.5 px-4">Authorized User</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171714]/08 text-[13px]">
              {initialUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#171714]">
                      {u.name}
                      {isCurrent && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#EFECE3] text-[#68665F]">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#68665F] font-mono text-[12.5px]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                          u.status === 'ACTIVE'
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                            : u.status === 'INVITED'
                            ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                            : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#68665F] text-[12.5px]">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Never logged in'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-[#68665F] m-0">
          To onboard additional technicians or revoke portal access for former studio employees, please{' '}
          <Link href="/requests/new?type=SUPPORT" className="text-[#F26522] hover:underline font-medium">
            submit an access request →
          </Link>
        </p>
      </section>

      {/* 5. Security & Credentials */}
      <section aria-labelledby="security-heading" className="border-t border-[#171714]/10 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="security-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
              SECURITY & CREDENTIALS
            </h2>
            <p className="text-[12.5px] text-[#68665F] mt-0.5 m-0">
              Personal password credentials for your dealer session.
            </p>
          </div>

          {!isChangingPassword && (
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(true);
                setPasswordSuccess(null);
                setPasswordError(null);
              }}
              className="px-3 py-1.5 rounded-[4px] border border-[#171714]/20 hover:border-[#171714] bg-white text-[12.5px] font-medium text-[#171714] transition-colors cursor-pointer"
            >
              Change Password
            </button>
          )}
        </div>

        {passwordSuccess && (
          <div className="p-3 rounded-[4px] bg-[#ECFDF5] border border-[#A7F3D0] text-[13px] text-[#065F46]">
            ✓ {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="p-3 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C]">
            {passwordError}
          </div>
        )}

        {!isChangingPassword ? (
          <div className="border border-[#171714]/10 rounded-[4px] bg-[#FCFBF7] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px]">
            <div>
              <span className="font-medium text-[#171714] block">Account Password Active</span>
              <span className="text-[#68665F] text-[12.5px] block mt-0.5">
                Signed in as {currentUser.email}. To keep your dealership records secure, ensure you use a strong, unique password.
              </span>
            </div>
            <span className="text-[12px] font-semibold text-[#065F46] inline-flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Secured
            </span>
          </div>
        ) : (
          <form onSubmit={handleSavePassword} className="border border-[#171714]/15 rounded-[4px] bg-[#FCFBF7] p-5 space-y-4 max-w-xl">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                Current Password <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                New Password (Minimum 8 Characters) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#68665F] mb-1">
                Confirm New Password <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-[4px] border border-[#171714]/20 bg-white text-[13px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div className="pt-3 border-t border-[#171714]/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2 rounded-[4px] text-[13px] font-medium text-[#68665F] hover:text-[#171714] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2 rounded-[4px] bg-[#171714] hover:bg-black text-white text-[13px] font-semibold disabled:opacity-50 transition-colors cursor-pointer"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

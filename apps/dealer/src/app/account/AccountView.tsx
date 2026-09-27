'use client';

import React, { useState } from 'react';
import type { DealerWithRelations, SafeDealerUser, DealerUser } from '@trionyx/types';

interface AccountViewProps {
  dealer: DealerWithRelations;
  currentUser: SafeDealerUser;
  initialUsers: DealerUser[];
}

export function AccountView({ dealer, currentUser, initialUsers }: AccountViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'users'>('profile');

  // Profile Form State
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
      const res = await fetch('/api/dealer/account', {
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
        throw new Error(data.error || 'Failed to update account details');
      }

      setProfileSuccess('Dealership contact details saved successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Something went wrong');
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
      const res = await fetch('/api/dealer/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Something went wrong');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-bold text-[#F26522] bg-[#F26522]/10 px-2 py-0.5 rounded">
                {dealer.dealerCode}
              </span>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                {dealer.status}
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-[#171714] tracking-tight mt-1">
              {dealer.businessName}
            </h1>
            <p className="text-[13.5px] text-[#68665F] mt-0.5">
              Manage dealership profile, credentials, and review authorized portal users.
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-[#171714]/10 sm:pl-6 text-[12.5px] text-[#68665F]">
            <span className="block font-semibold text-[#171714]">{currentUser.name}</span>
            <span className="block">{currentUser.email}</span>
            <span className="inline-block mt-1 text-[11px] text-[#F26522] font-semibold uppercase tracking-wider">
              Authorized User
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#171714]/10 mt-6 -mb-6 space-x-6 text-[13.5px]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#F26522] text-[#F26522]'
                : 'border-transparent text-[#68665F] hover:text-[#171714]'
            }`}
          >
            Dealership Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-[#F26522] text-[#F26522]'
                : 'border-transparent text-[#68665F] hover:text-[#171714]'
            }`}
          >
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-[#F26522] text-[#F26522]'
                : 'border-transparent text-[#68665F] hover:text-[#171714]'
            }`}
          >
            Authorized Portal Users ({initialUsers.length})
          </button>
        </div>
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Read-Only Verified Entity Information */}
          <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 shadow-[0_2px_8px_rgba(23,23,20,0.02)]">
            <h2 className="text-[15px] font-bold text-[#171714] tracking-tight">
              Verified Legal Registration
            </h2>
            <p className="text-[12.5px] text-[#68665F] mt-0.5">
              Official company identifiers on file with Trionyx. To request changes, contact Trionyx compliance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 rounded bg-[#EFECE3]/50 border border-[#171714]/08 text-[13px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
                  Legal Entity Name
                </span>
                <span className="font-semibold text-[#171714] mt-0.5 block">
                  {dealer.legalName || dealer.businessName}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
                  Dealer Code
                </span>
                <span className="font-mono font-bold text-[#171714] mt-0.5 block">
                  {dealer.dealerCode}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
                  GSTIN
                </span>
                <span className="font-mono text-[#171714] mt-0.5 block">
                  {dealer.gstin || 'Not registered'}
                </span>
              </div>
            </div>

            {/* Assigned Distributor Details */}
            <div className="mt-4 pt-4 border-t border-[#171714]/08 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
                  Assigned Regional Distributor
                </span>
                <span className="font-bold text-[#171714] text-[14px]">
                  {dealer.distributor?.businessName || 'Direct Trionyx Operations'}
                </span>
                {dealer.distributor && (
                  <span className="block text-[12px] text-[#68665F]">
                    {dealer.distributor.city}, {dealer.distributor.state} • {dealer.distributor.phone}
                  </span>
                )}
              </div>
              <div>
                <span className="px-2.5 py-1 rounded bg-[#EFECE3] text-[#171714] font-medium text-[12px]">
                  Fulfillment Partner
                </span>
              </div>
            </div>
          </div>

          {/* Editable Operational Contact Details */}
          <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 shadow-[0_2px_8px_rgba(23,23,20,0.02)]">
            <h2 className="text-[15px] font-bold text-[#171714] tracking-tight">
              Operational Contact & Delivery Address
            </h2>
            <p className="text-[12.5px] text-[#68665F] mt-0.5">
              Contact person and shipping coordinates used for daily coordination and dispatch.
            </p>

            {profileSuccess && (
              <div className="mt-4 p-3 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[13px] text-[#065F46]">
                ✓ {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="mt-4 p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C]">
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                    Primary Contact Person <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                    Phone Number <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Premises / Street"
                  className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Area / Landmark"
                  className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                    City <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                    State <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#171714]/08 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded bg-[#F26522] hover:bg-[#D9531E] text-white text-[13.5px] font-semibold shadow-[0_2px_8px_rgba(242,101,34,0.25)] disabled:opacity-50 transition-all"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 shadow-[0_2px_8px_rgba(23,23,20,0.02)] max-w-xl">
          <h2 className="text-[15px] font-bold text-[#171714] tracking-tight">
            Change Portal Password
          </h2>
          <p className="text-[12.5px] text-[#68665F] mt-0.5">
            Update your individual login credentials. Passwords must be at least 8 characters long.
          </p>

          {passwordSuccess && (
            <div className="mt-4 p-3 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[13px] text-[#065F46]">
              ✓ {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="mt-4 p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C]">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleSavePassword} className="mt-5 space-y-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                Current Password <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                New Password <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1">
                Confirm New Password <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              />
            </div>

            <div className="pt-4 border-t border-[#171714]/08 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2 rounded bg-[#171714] hover:bg-black text-white text-[13.5px] font-semibold disabled:opacity-50 transition-colors"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 shadow-[0_2px_8px_rgba(23,23,20,0.02)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-[#171714] tracking-tight">
                Authorized Portal Logins
              </h2>
              <p className="text-[12.5px] text-[#68665F] mt-0.5">
                Personnel authorized to access this dealership account on the Trionyx Portal.
              </p>
            </div>
          </div>

          <div className="border border-[#171714]/10 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EFECE3]/60 border-b border-[#171714]/10 text-[11.5px] font-bold uppercase tracking-wider text-[#68665F]">
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171714]/08 text-[13px]">
                {initialUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-white/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#171714]">
                        {u.name}
                        {isCurrent && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFECE3] text-[#68665F]">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#68665F] font-mono text-[12px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
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
                      <td className="py-3 px-4 text-[#68665F] text-[12px]">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Never'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded bg-[#EFECE3]/50 border border-[#171714]/10 text-[12.5px] text-[#68665F] space-y-1">
            <span className="font-bold text-[#171714] block">User Access Policy</span>
            <p>
              Dealer portal user credentials are provisioning-controlled. To invite a new team member,
              change roles, or revoke credentials, contact your Trionyx Account Manager or submit a
              portal support request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

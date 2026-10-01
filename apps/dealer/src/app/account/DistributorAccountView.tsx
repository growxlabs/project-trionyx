'use client';

import React, { useState } from 'react';
import type { SafeUser, DistributorWithRelations } from '@trionyx/types';

interface DistributorAccountViewProps {
  user: SafeUser;
  distributor: DistributorWithRelations;
}

export function DistributorAccountView({ user, distributor }: DistributorAccountViewProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

    setSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const res = await fetch('/api/dealer/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSuccess('Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setPasswordError(err.message || 'Unable to update password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 text-[#171714]">
      {/* 1. Header */}
      <div>
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0">
          Account & Territory Settings
        </h1>
        <p className="mt-1 text-[13.5px] text-[#68665F] m-0">
          Manage your distributor workspace credentials and regional profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Distributor Hub Profile */}
        <section className="bg-white p-6 rounded-[4px] border border-[#171714]/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#171714]/10">
            <div>
              <h2 className="text-[15px] font-bold text-[#171714] m-0">Regional Hub Information</h2>
              <p className="text-[12px] text-[#68665F] m-0 mt-0.5">Authorised distributor headquarters</p>
            </div>
            <span className="font-mono text-[11px] font-bold bg-[#F26522]/10 text-[#F26522] border border-[#F26522]/20 px-2 py-0.5 rounded-[2px]">
              {distributor.distributorCode}
            </span>
          </div>

          <div className="space-y-3 text-[13px]">
            <div>
              <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Business Name</span>
              <span className="font-semibold text-[#171714] text-[14px]">{distributor.businessName}</span>
            </div>

            <div>
              <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Assigned Territory</span>
              <span className="font-medium text-[#171714]">{distributor.territory || 'National / Regional'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Contact Person</span>
                <span className="font-medium text-[#171714]">{distributor.contactPerson || '—'}</span>
              </div>
              <div>
                <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Phone</span>
                <span className="font-medium text-[#171714]">{distributor.phone || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Email</span>
                <span className="font-medium text-[#171714] truncate block">{distributor.email || '—'}</span>
              </div>
              <div>
                <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Status</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-[2px] text-[10px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  {distributor.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#171714]/08">
              <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Location</span>
              <span className="font-medium text-[#171714]">
                {[distributor.addressLine1, distributor.city, distributor.state, distributor.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Authenticated User Profile & Security */}
        <section className="bg-white p-6 rounded-[4px] border border-[#171714]/10 space-y-4">
          <div className="pb-3 border-b border-[#171714]/10">
            <h2 className="text-[15px] font-bold text-[#171714] m-0">User Profile & Access</h2>
            <p className="text-[12px] text-[#68665F] m-0 mt-0.5">Your personal credentials in Trionyx Workspace</p>
          </div>

          <div className="space-y-3 text-[13px]">
            <div>
              <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Signed in as</span>
              <span className="font-bold text-[#171714] text-[14px]">{user.name}</span>
            </div>
            <div>
              <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Email</span>
              <span className="font-mono text-[#171714]">{user.email}</span>
            </div>
            <div>
              <span className="text-[#68665F] block text-[11.5px] font-semibold uppercase tracking-wider">Role</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#171714]/05 text-[#171714] font-semibold rounded-[2px] text-[11px] font-mono border border-[#171714]/10">
                {user.role}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#171714]/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-semibold text-[#171714]">Security & Password</div>
                <div className="text-[12px] text-[#68665F]">Keep your account secure with regular updates</div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="px-3 py-1.5 bg-white border border-[#171714]/20 hover:border-[#171714]/40 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer"
              >
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {passwordSuccess && (
              <div className="mt-3 p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] rounded-[4px] text-[12.5px]">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mt-3 p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded-[4px] text-[12.5px]">
                {passwordError}
              </div>
            )}

            {isChangingPassword && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3 pt-3 border-t border-[#171714]/10">
                <div>
                  <label className="block text-[12px] font-medium text-[#171714] mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#171714]/20 rounded-[4px] text-[13px] focus:outline-none focus:border-[#F26522]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#171714] mb-1">New Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#171714]/20 rounded-[4px] text-[13px] focus:outline-none focus:border-[#F26522]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#171714] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#171714]/20 rounded-[4px] text-[13px] focus:outline-none focus:border-[#F26522]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full py-2 bg-[#171714] text-white text-[13px] font-semibold rounded-[4px] hover:bg-[#171714]/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

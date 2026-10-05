'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Reset token is missing or invalid.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || 'Password reset failed. Link may be invalid or expired.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('A connection error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-4 rounded border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] text-[13px] font-medium text-center">
        No password reset token provided.
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] text-[13px]">
          Password reset successfully. You can now sign in with your new credentials.
        </div>
        <Link
          href="/login"
          className="block w-full py-2.5 px-4 text-center rounded bg-[#171717] text-white font-semibold text-[13.5px] hover:bg-black transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-[13px] rounded border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-[12.5px] font-semibold text-[#171717] mb-1">
          New Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          className="w-full px-3.5 py-2.5 rounded border border-[#171717]/20 bg-white text-[14px] text-[#171717] placeholder-[#737373]/50 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[12.5px] font-semibold text-[#171717] mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          className="w-full px-3.5 py-2.5 rounded border border-[#171717]/20 bg-white text-[14px] text-[#171717] placeholder-[#737373]/50 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded bg-[#171717] text-white font-semibold text-[14px] hover:bg-black transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Updating...' : 'Set New Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#171717]/10 rounded-lg p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded bg-[#171717] text-white font-bold text-base items-center justify-center mb-3">
            TRX
          </div>
          <span className="block text-[11px] font-bold tracking-[0.16em] text-[#737373]">
            Trionyx Automotive
          </span>
          <h1 className="text-[22px] font-bold text-[#171717] mt-1 tracking-tight">
            Create New Password
          </h1>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-[#737373]">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Activation link is missing a valid token. Please contact Trionyx.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || 'Activation failed. Link may be invalid or expired.');
        setIsLoading(false);
        return;
      }

      router.push('/overview');
      router.refresh();
    } catch {
      setError('A connection error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-4 rounded border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] text-[13px] font-medium text-center">
        No activation token provided. Please use the complete activation link provided by your distributor.
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
        <label className="block text-[12.5px] font-semibold text-[#171714] mb-1">
          Create Portal Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full px-3.5 py-2.5 rounded border border-[#171714]/20 bg-white text-[14px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] transition-colors pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#68665F] hover:text-[#171714]"
            tabIndex={-1}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[12.5px] font-semibold text-[#171714] mb-1">
          Confirm Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
          className="w-full px-3.5 py-2.5 rounded border border-[#171714]/20 bg-white text-[14px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-3 py-2.5 px-4 rounded bg-[#171714] text-white font-semibold text-[14px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Activating Account...</span>
          </>
        ) : (
          <span>Activate Account & Sign In</span>
        )}
      </button>
    </form>
  );
}

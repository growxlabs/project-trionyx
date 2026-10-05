'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.devResetToken) {
        setDevResetToken(data.devResetToken);
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

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
            Reset Password
          </h1>
          <p className="text-[13px] text-[#737373] mt-1.5">
            Enter your authorized dealer email to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] text-[13px]">
              If an authorized account matches that email, reset instructions have been dispatched.
            </div>

            {devResetToken && (
              <div className="p-3.5 rounded border border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412] text-[12px] space-y-1.5">
                <p className="font-semibold tracking-wider text-[11px]">Development Password Reset Link:</p>
                <Link
                  href={`/reset-password?token=${devResetToken}`}
                  className="font-mono underline break-all text-[#C2410C]"
                >
                  /reset-password?token={devResetToken}
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="block w-full py-2.5 px-4 text-center rounded border border-[#171717]/20 text-[#171717] font-semibold text-[13.5px] hover:bg-[#EBEBEB] transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#171717] mb-1">
                Authorized Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dealer@studio.com"
                className="w-full px-3.5 py-2.5 rounded border border-[#171717]/20 bg-white text-[14px] text-[#171717] placeholder-[#737373]/50 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded bg-[#171717] text-white font-semibold text-[14px] hover:bg-black transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Send Recovery Instructions'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-[12.5px] text-[#737373] hover:text-[#171717]">
                Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

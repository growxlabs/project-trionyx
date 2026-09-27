'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function InternalLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/internal/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        setErrorMessage(data.error?.message || data.error || 'Email or password is incorrect.');
        // Clear password on failure for security; preserve email
        setPassword('');
        setIsLoading(false);
        return;
      }

      // Successful login -> Navigate to protected overview shell
      router.push('/overview');
      router.refresh();
    } catch {
      setErrorMessage('Unable to sign in right now. Try again later.');
      setPassword('');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--background)] px-5 py-8 sm:px-6">
      <div className="w-full max-w-[440px]">
        {/* Card Container */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-7 sm:p-9 shadow-[0_2px_12px_rgba(23,23,20,0.04)]">
          {/* Brand Header */}
          <div className="flex flex-col items-start mb-8">
            <div className="h-10 w-auto mb-5 relative flex items-center">
              <Image
                src="/brand/trionyx-logo-dark.png"
                alt="Trionyx — Always Exceed Expectations"
                width={2092}
                height={752}
                priority
                className="h-10 w-auto object-contain"
              />
            </div>

            <h1 className="text-[24px] sm:text-[26px] font-semibold text-[var(--text-primary)] tracking-[-0.025em] leading-tight m-0">
              Sign in to Trionyx
            </h1>
            <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mt-2 m-0">
              For authorised distributors and Trionyx team members.
            </p>
          </div>

          {/* Inline Error Announcement */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2.5 p-3.5 mb-6 rounded-[4px] bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px] leading-normal animate-in fade-in duration-150"
            >
              <svg
                className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-danger)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-semibold tracking-wide uppercase text-[var(--text-primary)] mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your email address"
                className="w-full h-[52px] px-4 bg-[var(--surface-raised)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 text-[15px] rounded-[4px] border border-[var(--border)] transition-all duration-150 outline-none hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]/15 disabled:bg-[var(--surface-subtle)] disabled:cursor-not-allowed"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-semibold tracking-wide uppercase text-[var(--text-primary)] mb-2"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••••••"
                  className="w-full h-[52px] pl-4 pr-12 bg-[var(--surface-raised)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 text-[15px] rounded-[4px] border border-[var(--border)] transition-all duration-150 outline-none hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]/15 disabled:bg-[var(--surface-subtle)] disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F26522]"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[15px] font-semibold rounded-[4px] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(242,101,34,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F26522] focus-visible:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-[var(--background)]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { DistributorOpportunity } from '@/data/distributorLocations';

export interface DistributorEnquiryModalProps {
  opportunity: DistributorOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  businessType: string;
  message: string;
  website: string; // Honeypot
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  businessType?: string;
  message?: string;
}

const initialFormState: FormState = {
  fullName: '',
  phone: '',
  email: '',
  companyName: '',
  businessType: '',
  message: '',
  website: '',
};

export function DistributorEnquiryModal({
  opportunity,
  isOpen,
  onClose,
}: DistributorEnquiryModalProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [enquiryCode, setEnquiryCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fullNameInputRef = useRef<HTMLInputElement>(null);

  // The parent remounts this component per opportunity (via `key`), so state starts fresh; only focus needs syncing.
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fullNameInputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !opportunity) return null;

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errs.fullName = 'Full Name must be at least 2 characters';
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      errs.phone = 'Please enter a valid phone number (at least 10 digits)';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.companyName.trim()) {
      errs.companyName = 'Company / Business Name is required';
    }
    if (!form.businessType.trim()) {
      errs.businessType = 'Current Business is required';
    }
    if (!form.message.trim()) {
      errs.message = 'Please provide a message or outline your distribution plan';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/public/contact-enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISTRIBUTION_ENQUIRY',
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          companyName: form.companyName.trim(),
          businessType: form.businessType.trim(),
          city: '',
          state: opportunity.state,
          territory: opportunity.state,
          message: form.message.trim(),
          website: form.website, // honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSubmitError(data.error?.message || 'Something went wrong. Please try again.');
        return;
      }

      setEnquiryCode(data.data?.enquiryCode || 'TRX-ENQ-CONFIRMED');
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'w-full h-12 rounded-xl border border-[var(--color-hairline)] bg-[rgba(236,231,222,0.05)] px-4 text-[0.9375rem] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] transition-colors hover:border-[rgba(236,231,222,0.22)] focus:outline-none focus:border-[var(--color-text)] focus:bg-[rgba(236,231,222,0.07)]';

  const labelBase = 'block text-sm text-[var(--color-text-muted)] mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="distributor-enquiry-heading"
        className="relative z-10 my-8 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:p-8"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[rgba(236,231,222,0.08)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {enquiryCode ? (
          /* Success View */
          <div className="pt-2">
            <h3 id="distributor-enquiry-heading" className="m-0 pr-10 text-[clamp(1.75rem,3vw,2.25rem)] font-normal leading-tight tracking-[-0.025em] text-[var(--color-text)]">
              Thank you. We&apos;ll be in touch shortly.
            </h3>

            <dl className="my-6 border-y border-[var(--color-hairline)]">
              <div className="flex items-baseline justify-between gap-4 py-4">
                <dt className="text-sm text-[var(--color-text-faint)]">Reference</dt>
                <dd className="m-0 font-mono text-[var(--color-text)]">{enquiryCode}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={onClose}
              className="pill-button w-full justify-center"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form View */
          <>
            <h2
              id="distributor-enquiry-heading"
              className="mb-6 mt-0 pr-10 text-[clamp(1.75rem,3vw,2.25rem)] font-normal leading-tight tracking-[-0.025em] text-[var(--color-text)]"
            >
              {opportunity.state}
            </h2>

            {submitError && (
              <div className="mb-5 rounded-xl border border-[rgba(232,144,122,0.4)] bg-[rgba(232,144,122,0.08)] px-4 py-3.5 text-sm text-[#E8907A]">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Honeypot field (hidden from real users) */}
              <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="dist-fullname" className={labelBase}>
                  Full Name <span className="text-[var(--color-primary)]">*</span>
                </label>
                <input
                  ref={fullNameInputRef}
                  id="dist-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder="e.g. Vikram Reddy"
                  className={inputBase}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-[#E8907A]">{errors.fullName}</p>
                )}
              </div>

              {/* Phone & Email (2 columns on tablet/desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dist-phone" className={labelBase}>
                    Phone Number <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    id="dist-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputBase}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-[#E8907A]">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dist-email" className={labelBase}>
                    Email <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    id="dist-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="name@company.com"
                    className={inputBase}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-[#E8907A]">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Company / Business Name */}
              <div>
                <label htmlFor="dist-company" className={labelBase}>
                  Company / Business Name <span className="text-[var(--color-primary)]">*</span>
                </label>
                <input
                  id="dist-company"
                  type="text"
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  placeholder="e.g. Apex Auto Ventures LLP"
                  className={inputBase}
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-[#E8907A]">{errors.companyName}</p>
                )}
              </div>

              {/* Current Business */}
              <div>
                <label htmlFor="dist-business" className={labelBase}>
                  Current Business <span className="text-[var(--color-primary)]">*</span>
                </label>
                <input
                  id="dist-business"
                  type="text"
                  value={form.businessType}
                  onChange={(e) => update('businessType', e.target.value)}
                  placeholder="e.g. Detailing Studio, Automotive Distribution, Workshop"
                  className={inputBase}
                />
                {errors.businessType && (
                  <p className="mt-1 text-xs text-[#E8907A]">{errors.businessType}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="dist-message" className={labelBase}>
                  Message <span className="text-[var(--color-primary)]">*</span>
                </label>
                <textarea
                  id="dist-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder={`Tell us about your distribution capabilities in ${opportunity.state}...`}
                  className="w-full rounded-xl border border-[var(--color-hairline)] bg-[rgba(236,231,222,0.05)] px-4 py-3 text-[0.9375rem] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] transition-colors hover:border-[rgba(236,231,222,0.22)] focus:outline-none focus:border-[var(--color-text)] focus:bg-[rgba(236,231,222,0.07)] resize-none"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-[#E8907A]">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="pill-button w-full justify-center"
                >
                  {submitting ? 'Sending…' : 'Send enquiry'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ContactEnquiryType } from '@trionyx/types';

/* ─── Enquiry Type Definitions ─── */
const ENQUIRY_TYPES: { value: ContactEnquiryType; label: string }[] = [
  { value: 'PRODUCT_ENQUIRY', label: 'Product Enquiry' },
  { value: 'DEALER_ENQUIRY', label: 'Dealer Enquiry' },
  { value: 'DISTRIBUTION_ENQUIRY', label: 'Distribution Enquiry' },
  { value: 'PRODUCT_SUPPORT', label: 'Product Support' },
  { value: 'GENERAL_ENQUIRY', label: 'General Enquiry' },
];

/* ─── Indian States ─── */
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

/* ─── Custom Styled Select ─── */
interface SelectOption { value: string; label: string }

function StyledSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select...',
}: {
  id: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      // Arrow navigation within open list
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIdx = options.findIndex((o) => o.value === value);
        const next = e.key === 'ArrowDown'
          ? Math.min(currentIdx + 1, options.length - 1)
          : Math.max(currentIdx - 1, 0);
        onChange(options[next].value);
      }
    },
    [open, value, options, onChange]
  );

  // Scroll selected option into view when opening
  useEffect(() => {
    if (open && listRef.current && value) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [open, value]);

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full h-11 px-3.5 pr-10 bg-white border rounded-[6px] text-[14px] text-left transition-colors cursor-pointer flex items-center focus:outline-none ${
          open
            ? 'border-[#F26522] ring-1 ring-[#F26522]/20'
            : 'border-[rgba(23,23,20,0.12)] hover:border-[rgba(23,23,20,0.22)]'
        } ${selectedLabel ? 'text-[#171714]' : 'text-[#68665F]/60'}`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        {/* Chevron */}
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#68665F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Dropdown List */}
      {open && (
        <ul
          id={`${id}-listbox`}
          ref={listRef}
          role="listbox"
          aria-activedescendant={value ? `${id}-option-${value}` : undefined}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border border-[rgba(23,23,20,0.12)] rounded-[6px] shadow-[0_8px_24px_rgba(23,23,20,0.08)] py-1"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`${id}-option-${opt.value}`}
                role="option"
                aria-selected={isSelected}
                data-active={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center px-3.5 h-10 text-[14px] cursor-pointer transition-colors select-none ${
                  isSelected
                    ? 'text-[#F26522] bg-[#F26522]/[0.04] font-medium'
                    : 'text-[#171714] hover:bg-[#EFECE3]/60'
                }`}
              >
                {opt.label}
                {isSelected && (
                  <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── Field Error Display ─── */
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-[12px] text-[#D9362B]">{error}</p>;
}

/* ─── Input Styles ─── */
const inputBase =
  'w-full h-11 px-3.5 bg-white border border-[rgba(23,23,20,0.12)] rounded-[6px] text-[14px] text-[#171714] placeholder:text-[#68665F]/60 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors';

const textareaBase =
  'w-full px-3.5 py-3 bg-white border border-[rgba(23,23,20,0.12)] rounded-[6px] text-[14px] text-[#171714] placeholder:text-[#68665F]/60 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors resize-none';

const labelBase = 'block text-[13px] font-medium text-[#171714] mb-1.5';

/* ─── Types ─── */
interface FormData {
  type: ContactEnquiryType | '';
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  businessAddress: string;
  businessType: string;
  city: string;
  state: string;
  pincode: string;
  territory: string;
  productName: string;
  purchaseDealerDetails: string;
  message: string;
  website: string; // honeypot
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  type: '',
  fullName: '',
  phone: '',
  email: '',
  companyName: '',
  businessAddress: '',
  businessType: '',
  city: '',
  state: '',
  pincode: '',
  territory: '',
  productName: '',
  purchaseDealerDetails: '',
  message: '',
  website: '',
};

/* ─── Select option sets ─── */
const BUSINESS_TYPES: SelectOption[] = [
  { value: 'Detailing Studio', label: 'Detailing Studio' },
  { value: 'Car Care Centre', label: 'Car Care Centre' },
  { value: 'Automobile Workshop', label: 'Automobile Workshop' },
  { value: 'Distributor', label: 'Distributor' },
  { value: 'Retailer', label: 'Retailer' },
  { value: 'Other', label: 'Other' },
];

const STATE_OPTIONS: SelectOption[] = INDIAN_STATES.map((s) => ({ value: s, label: s }));

export function ContactForm() {
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [enquiryCode, setEnquiryCode] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      type: value as ContactEnquiryType | '',
      companyName: '',
      businessAddress: '',
      businessType: '',
      territory: '',
      productName: '',
      purchaseDealerDetails: '',
    }));
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.type) errs.type = 'Please select an enquiry type';
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters';
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      errs.phone = 'Please enter a valid phone number (at least 10 digits)';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.city.trim()) {
      errs.city = 'City is required';
    }
    if (!form.state.trim()) {
      errs.state = 'State is required';
    }
    if (!form.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      errs.pincode = 'Pincode must be exactly 6 digits';
    }
    if (!form.message.trim()) {
      errs.message = form.type === 'PRODUCT_SUPPORT' ? 'Please describe the issue' : 'Message is required';
    }

    // Conditional requirements
    if (form.type === 'DEALER_ENQUIRY') {
      if (!form.companyName.trim()) {
        errs.companyName = 'Business / Company Name is required';
      }
      if (!form.businessAddress.trim()) {
        errs.businessAddress = 'Business Address is required';
      }
    }

    if (form.type === 'DISTRIBUTION_ENQUIRY') {
      if (!form.companyName.trim()) {
        errs.companyName = 'Company Name is required';
      }
      if (!form.businessAddress.trim()) {
        errs.businessAddress = 'Business Address is required';
      }
      if (!form.territory.trim()) {
        errs.territory = 'Territory / Area is required';
      }
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
          type: form.type,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          companyName: form.companyName.trim() || undefined,
          businessAddress: form.businessAddress.trim() || undefined,
          businessType: form.businessType.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          territory: form.territory.trim() || undefined,
          purchaseDealerDetails: form.purchaseDealerDetails.trim() || undefined,
          message: form.message.trim(),
          website: form.website, // honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSubmitError(data.error?.message || 'Something went wrong. Please try again.');
        return;
      }

      setEnquiryCode(data.data?.enquiryCode || '');
      setSubmitted(true);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Dynamic field visibility ─── */
  const type = form.type;
  const showDealerFields = type === 'DEALER_ENQUIRY';
  const showDistributionFields = type === 'DISTRIBUTION_ENQUIRY';
  const showSupportFields = type === 'PRODUCT_SUPPORT';
  const showProductField = type === 'PRODUCT_ENQUIRY' || type === 'PRODUCT_SUPPORT';
  const isSupport = type === 'PRODUCT_SUPPORT';

  /* ─── Success State ─── */
  if (submitted) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#EFECE3] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-[24px] font-semibold text-[#171714] mb-3">
          Thank you.
        </h3>
        <p className="text-[15px] text-[#68665F] mb-2 max-w-md mx-auto">
          Your enquiry has been received.
        </p>
        <p className="text-[14px] text-[#68665F] mb-6 max-w-md mx-auto">
          The Trionyx team will contact you regarding the next steps.
        </p>
        {enquiryCode && (
          <p className="text-[13px] font-mono text-[#68665F]">
            Reference: <span className="text-[#171714] font-semibold">{enquiryCode}</span>
          </p>
        )}
        <button
          onClick={() => {
            setSubmitted(false);
            setForm(initialFormData);
            setErrors({});
            setEnquiryCode('');
          }}
          className="mt-8 text-[14px] font-medium text-[#F26522] hover:text-[#DC5414] transition-colors"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  /* ─── Form ─── */
  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot — hidden from real users */}
      <div className="absolute -top-[9999px] -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
        />
      </div>

      {/* Enquiry Type — Dropdown */}
      <div>
        <label htmlFor="enquiryType" className={labelBase}>
          Enquiry Type <span className="text-[#D9362B]">*</span>
        </label>
        <StyledSelect
          id="enquiryType"
          options={ENQUIRY_TYPES}
          value={form.type}
          onChange={handleTypeChange}
          placeholder="Select an enquiry type"
        />
        <FieldError error={errors.type} />
      </div>

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className={labelBase}>
            Full Name <span className="text-[#D9362B]">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            className={inputBase}
            placeholder="Your full name"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            autoComplete="name"
          />
          <FieldError error={errors.fullName} />
        </div>
        <div>
          <label htmlFor="phone" className={labelBase}>
            Phone <span className="text-[#D9362B]">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            className={inputBase}
            placeholder="10-digit phone number"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            autoComplete="tel"
          />
          <FieldError error={errors.phone} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelBase}>
          Email <span className="text-[#D9362B]">*</span>
        </label>
        <input
          type="email"
          id="email"
          className={inputBase}
          placeholder="your@email.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          autoComplete="email"
        />
        <FieldError error={errors.email} />
      </div>

      {/* ─── Conditional Fields ─── */}

      {/* Product Enquiry & Support: Product */}
      {showProductField && (
        <div>
          <label htmlFor="productName" className={labelBase}>
            Product
          </label>
          <input
            type="text"
            id="productName"
            className={inputBase}
            placeholder="e.g. Trionyx Ceramic Armor / Graphene Infused"
            value={form.productName}
            onChange={(e) => update('productName', e.target.value)}
          />
        </div>
      )}

      {/* Dealer Enquiry Fields */}
      {showDealerFields && (
        <>
          <div>
            <label htmlFor="companyName" className={labelBase}>
              Business / Company Name <span className="text-[#D9362B]">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              className={inputBase}
              placeholder="Your studio or business name"
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              autoComplete="organization"
            />
            <FieldError error={errors.companyName} />
          </div>

          <div>
            <label htmlFor="businessAddress" className={labelBase}>
              Business Address <span className="text-[#D9362B]">*</span>
            </label>
            <input
              type="text"
              id="businessAddress"
              className={inputBase}
              placeholder="Shop/studio address, street, landmark"
              value={form.businessAddress}
              onChange={(e) => update('businessAddress', e.target.value)}
            />
            <FieldError error={errors.businessAddress} />
          </div>

          <div>
            <label htmlFor="businessType" className={labelBase}>
              Current Business Type
            </label>
            <StyledSelect
              id="businessType"
              options={BUSINESS_TYPES}
              value={form.businessType}
              onChange={(val) => update('businessType', val)}
              placeholder="Select current business type"
            />
          </div>
        </>
      )}

      {/* Distribution Enquiry Fields */}
      {showDistributionFields && (
        <>
          <div>
            <label htmlFor="companyName" className={labelBase}>
              Company Name <span className="text-[#D9362B]">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              className={inputBase}
              placeholder="Your distribution company name"
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              autoComplete="organization"
            />
            <FieldError error={errors.companyName} />
          </div>

          <div>
            <label htmlFor="businessAddress" className={labelBase}>
              Business Address <span className="text-[#D9362B]">*</span>
            </label>
            <input
              type="text"
              id="businessAddress"
              className={inputBase}
              placeholder="Office/warehouse address, street"
              value={form.businessAddress}
              onChange={(e) => update('businessAddress', e.target.value)}
            />
            <FieldError error={errors.businessAddress} />
          </div>

          <div>
            <label htmlFor="territory" className={labelBase}>
              Territory / Area <span className="text-[#D9362B]">*</span>
            </label>
            <input
              type="text"
              id="territory"
              className={inputBase}
              placeholder="e.g. Western Maharashtra / North Karnataka"
              value={form.territory}
              onChange={(e) => update('territory', e.target.value)}
            />
            <FieldError error={errors.territory} />
          </div>

          <div>
            <label htmlFor="businessType" className={labelBase}>
              Business Type
            </label>
            <StyledSelect
              id="businessType"
              options={BUSINESS_TYPES}
              value={form.businessType}
              onChange={(val) => update('businessType', val)}
              placeholder="Select business type"
            />
          </div>
        </>
      )}

      {/* Product Support: Purchase / Dealer Details */}
      {showSupportFields && (
        <div>
          <label htmlFor="purchaseDealerDetails" className={labelBase}>
            Purchase / Dealer Details
          </label>
          <input
            type="text"
            id="purchaseDealerDetails"
            className={inputBase}
            placeholder="Dealer or studio name, city"
            value={form.purchaseDealerDetails}
            onChange={(e) => update('purchaseDealerDetails', e.target.value)}
          />
          <p className="mt-1 text-[12px] text-[#68665F]">
            If you remember the dealer or studio, share their name and city.
          </p>
        </div>
      )}

      {/* ─── Base Location Fields: City, State, Pincode ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className={labelBase}>
            City <span className="text-[#D9362B]">*</span>
          </label>
          <input
            type="text"
            id="city"
            className={inputBase}
            placeholder="Your city"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
          />
          <FieldError error={errors.city} />
        </div>
        <div>
          <label htmlFor="state" className={labelBase}>
            State <span className="text-[#D9362B]">*</span>
          </label>
          <StyledSelect
            id="state"
            options={STATE_OPTIONS}
            value={form.state}
            onChange={(val) => update('state', val)}
            placeholder="Select state"
          />
          <FieldError error={errors.state} />
        </div>
      </div>

      <div>
        <label htmlFor="pincode" className={labelBase}>
          Pincode <span className="text-[#D9362B]">*</span>
        </label>
        <input
          type="text"
          id="pincode"
          maxLength={6}
          className={inputBase}
          placeholder="6-digit Indian postal code"
          value={form.pincode}
          onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <FieldError error={errors.pincode} />
      </div>

      {/* Message — label changes for Product Support */}
      <div>
        <label htmlFor="message" className={labelBase}>
          {isSupport ? 'Describe the issue' : 'Message'} <span className="text-[#D9362B]">*</span>
        </label>
        <textarea
          id="message"
          className={textareaBase}
          rows={4}
          placeholder={isSupport ? 'Describe the issue you are experiencing in detail...' : 'Tell us more about your enquiry...'}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          maxLength={2000}
        />
        <div className="flex items-center justify-between mt-1">
          <FieldError error={errors.message} />
          <p className="text-[12px] text-[#68665F] ml-auto">
            {form.message.length}/2000
          </p>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="px-4 py-3 rounded-[6px] bg-[#D9362B]/[0.06] border border-[#D9362B]/20">
          <p className="text-[13px] text-[#D9362B]">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto h-12 px-8 bg-[#F26522] text-white text-[15px] font-semibold rounded-[3px] hover:bg-[#DC5414] active:bg-[#C4460D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(242,101,34,0.12)] inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Submitting...
            </>
          ) : (
            'Send Enquiry'
          )}
        </button>
      </div>
    </form>
  );
}

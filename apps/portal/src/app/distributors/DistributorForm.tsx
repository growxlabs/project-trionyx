'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DistributorWithRelations, DistributorStatus } from '@trionyx/types';

interface DistributorFormProps {
  initialData?: DistributorWithRelations;
  isEditing?: boolean;
}

export function DistributorForm({ initialData, isEditing = false }: DistributorFormProps) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [legalName, setLegalName] = useState(initialData?.legalName || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState(initialData?.alternatePhone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [addressLine1, setAddressLine1] = useState(initialData?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(initialData?.addressLine2 || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [district, setDistrict] = useState(initialData?.district || '');
  const [state, setState] = useState(initialData?.state || '');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
  const [country] = useState(initialData?.country || 'India');
  const [territory, setTerritory] = useState(initialData?.territory || '');
  const [status, setStatus] = useState<DistributorStatus>(initialData?.status || 'ACTIVE');
  const [gstin, setGstin] = useState(initialData?.gstin || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        businessName,
        legalName: legalName || null,
        contactPerson,
        phone,
        alternatePhone: alternatePhone || null,
        email: email || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city,
        district: district || null,
        state,
        postalCode: postalCode || null,
        country,
        territory: territory || null,
        status,
        gstin: gstin || null,
        notes: notes || null,
      };

      const url = isEditing ? `/api/distributors/${initialData?.id}` : '/api/distributors';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save distributor');
      }

      router.push(`/distributors/${data.distributor.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3.5 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[var(--status-danger)] hover:text-black font-semibold text-[14px]"
          >
            ×
          </button>
        </div>
      )}

      {/* Section 1: Business Identity */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Business Identification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Business Name <span className="text-[var(--accent-text)]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Auto Distributors"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Legal / Registered Name
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Automotive Solutions Pvt Ltd"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              GSTIN
            </label>
            <input
              type="text"
              placeholder="e.g. 29ABCDE1234F1Z5"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded font-mono uppercase focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Operating Territory / Region
            </label>
            <input
              type="text"
              placeholder="e.g. Karnataka & Northern Kerala"
              value={territory}
              onChange={(e) => setTerritory(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Operational Status <span className="text-[var(--accent-text)]">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DistributorStatus)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none bg-[var(--surface-raised)]"
            >
              <option value="ACTIVE">ACTIVE — Normal Operations</option>
              <option value="INACTIVE">INACTIVE — Dormant</option>
              <option value="SUSPENDED">SUSPENDED — Blocked from fulfillment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Contact Information */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Contact Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Primary Contact Person <span className="text-[var(--accent-text)]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Primary Phone <span className="text-[var(--accent-text)]">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Alternate Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. 080-23456789"
              value={alternatePhone}
              onChange={(e) => setAlternatePhone(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. contact@apexauto.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Physical Address */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Location & Facility Address
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              placeholder="Building, street, landmark"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              placeholder="Industrial area, floor, unit number"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              City <span className="text-[var(--accent-text)]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              District
            </label>
            <input
              type="text"
              placeholder="e.g. Bengaluru Urban"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              State <span className="text-[var(--accent-text)]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Karnataka"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Postal Code (PIN)
            </label>
            <input
              type="text"
              placeholder="e.g. 560001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Operational Notes */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Operational Notes
        </h2>
        <div>
          <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
            General Notes & Special Arrangements
          </label>
          <textarea
            rows={3}
            placeholder="Special commercial terms, transport logistics, warehouse capacity..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
          />
        </div>
      </div>

      {/* Submit / Cancel Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={isEditing ? `/distributors/${initialData?.id}` : '/distributors'}
          className="px-4 py-2 rounded text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Distributor' : 'Register Distributor'}
        </button>
      </div>
    </form>
  );
}

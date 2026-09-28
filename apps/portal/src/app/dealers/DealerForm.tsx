'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DealerWithRelations, DealerStatus } from '@trionyx/types';

interface DealerFormProps {
  initialData?: DealerWithRelations;
  distributors: Array<{ id: string; distributorCode: string; businessName: string; city: string; state: string }>;
  isEditing?: boolean;
}

export function DealerForm({ initialData, distributors, isEditing = false }: DealerFormProps) {
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
  const [distributorId, setDistributorId] = useState(initialData?.distributorId || '');
  const [status, setStatus] = useState<DealerStatus>(initialData?.status || 'ACTIVE');
  const [gstin, setGstin] = useState(initialData?.gstin || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
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
        status,
        gstin: gstin || null,
        notes: notes || null,
      };

      // On creation, allow assigning initial distributor
      if (!isEditing) {
        payload.distributorId = distributorId || null;
      }

      const url = isEditing ? `/api/dealers/${initialData?.id}` : '/api/dealers';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save dealer');
      }

      router.push(`/dealers/${data.dealer.id}`);
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

      {/* Section 1: Business Identification */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Studio / Dealer Identity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Studio / Dealer Name <span className="text-[var(--accent-text)]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Auto Detailing Studio"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Legal / Registered Entity Name
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Detailing LLP"
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
              Operational Status <span className="text-[var(--accent-text)]">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DealerStatus)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none bg-[var(--surface-raised)]"
            >
              <option value="ACTIVE">ACTIVE — Operating & Certified</option>
              <option value="INACTIVE">INACTIVE — Dormant</option>
              <option value="SUSPENDED">SUSPENDED — Blocked</option>
            </select>
          </div>

          {!isEditing && (
            <div className="sm:col-span-2">
              <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
                Assigned Distributor
              </label>
              <select
                value={distributorId}
                onChange={(e) => setDistributorId(e.target.value)}
                className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none bg-[var(--surface-raised)]"
              >
                <option value="">— Unassigned (Direct / No Distributor Assigned) —</option>
                {distributors.map((dst) => (
                  <option key={dst.id} value={dst.id}>
                    {dst.businessName} ({dst.distributorCode}) — {dst.city}, {dst.state}
                  </option>
                ))}
              </select>
              <p className="text-[11.5px] text-[var(--text-secondary)] mt-1">
                Dealers can be left unassigned initially or assigned to an active regional distributor.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Contact Information */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
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
              placeholder="e.g. Arun Prakash"
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
              placeholder="e.g. 9845012345"
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
              placeholder="e.g. 080-87654321"
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
              placeholder="e.g. studio@apexdetailing.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Studio / Workshop Address */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Workshop & Studio Address
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              placeholder="Shop/Unit number, building name, road"
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
              placeholder="Landmark, commercial area"
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
              placeholder="e.g. Mysuru"
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
              placeholder="e.g. Mysuru"
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
              placeholder="e.g. 570001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-1.5 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Operational Notes */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded p-5 space-y-4 shadow-sm">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Studio Specifications & Notes
        </h2>
        <div>
          <label className="block text-[12.5px] font-medium text-[var(--text-primary)] mb-1">
            Studio Details & Service Specialization
          </label>
          <textarea
            rows={3}
            placeholder="Bay capacity, PPF installation bay availability, ceramic coating oven, certified staff..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-[var(--border)] rounded focus:ring-1 focus:ring-[var(--focus-ring)] focus:border-[var(--accent)] outline-none"
          />
        </div>
      </div>

      {/* Submit / Cancel Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={isEditing ? `/dealers/${initialData?.id}` : '/dealers'}
          className="px-4 py-2 rounded text-[13px] font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-medium transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Dealer' : 'Register Dealer'}
        </button>
      </div>
    </form>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DealerRequestType, DealerRequestPriority } from '@trionyx/types';

interface ProductOption {
  id: string;
  name: string;
  code: string;
}

interface DealerOption {
  id: string;
  name: string;
  code: string;
}

interface NewRequestFormProps {
  products: ProductOption[];
  dealers?: DealerOption[];
  initialProductId?: string;
  initialSubject?: string;
  initialType?: string;
}

export function NewRequestForm({
  products,
  dealers = [],
  initialProductId = '',
  initialSubject = '',
  initialType = '',
}: NewRequestFormProps) {
  const router = useRouter();

  const validTypes: DealerRequestType[] = ['PRODUCT_ENQUIRY', 'AVAILABILITY', 'GENERAL_SUPPORT', 'OTHER'];
  const resolvedType = validTypes.includes(initialType as DealerRequestType)
    ? (initialType as DealerRequestType)
    : initialProductId
    ? 'AVAILABILITY'
    : 'PRODUCT_ENQUIRY';

  const [type, setType] = useState<DealerRequestType>(resolvedType);
  const [dealerId, setDealerId] = useState<string>(dealers.length === 1 ? dealers[0].id : '');
  const [productId, setProductId] = useState<string>(initialProductId);
  const [priority, setPriority] = useState<DealerRequestPriority>('MEDIUM');
  const [subject, setSubject] = useState<string>(initialSubject);
  const [description, setDescription] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/dealer/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          productId: productId || undefined,
          dealerId: dealerId || undefined,
          priority,
          subject,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request');
      }

      router.push(`/requests/${data.request.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* 1. Breadcrumb */}
      <div>
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Requests
        </Link>
      </div>

      {/* 2. Header */}
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-[-0.02em] text-[#171717] m-0">
          New Request
        </h1>
        <p className="text-[13.5px] text-[#737373] mt-1 m-0">
          Submit an inventory replenishment request, product query, or technical support ticket.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] flex items-start gap-2.5">
          <svg className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 3. Form Card */}
      <div className="bg-white rounded-[8px] border border-neutral-200 p-6 sm:p-7 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] mb-1.5">
                Request Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DealerRequestType)}
                className="w-full px-3.5 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13.5px] text-[#171717] focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors"
                required
              >
                <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
                <option value="AVAILABILITY">Stock Availability &amp; Allocation</option>
                <option value="GENERAL_SUPPORT">General Support</option>
                <option value="OTHER">Other Operational Query</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DealerRequestPriority)}
                className="w-full px-3.5 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13.5px] text-[#171717] focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="HIGH">High (Urgent customer requirement)</option>
                <option value="URGENT">Urgent (Line stoppage / critical)</option>
              </select>
            </div>
          </div>

          {dealers.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] mb-1.5">
                Dealership Location <span className="font-normal lowercase text-neutral-400">(optional)</span>
              </label>
              <select
                value={dealerId}
                onChange={(e) => setDealerId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13.5px] text-[#171717] focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors"
              >
                <option value="">Regional Hub / Direct</option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] mb-1.5">
              Associated Product <span className="font-normal lowercase text-neutral-400">(optional)</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13.5px] text-[#171717] focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors"
            >
              <option value="">None / General Inquiry</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] mb-1.5">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Allocation check for 50 units Android Multimedia Player"
              className="w-full px-3.5 py-2 rounded-[4px] border border-neutral-200 bg-white text-[13.5px] text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#737373] mb-1.5">
              Message &amp; Requirement Details *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify requested units, required delivery date, fitment queries, or vehicle details..."
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-[4px] border border-neutral-200 bg-white text-[13.5px] text-[#171717] placeholder-neutral-400 focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 transition-colors"
              required
              minLength={5}
              maxLength={2000}
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
            <Link
              href="/requests"
              className="px-4 py-2 text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] disabled:opacity-50 text-white text-[13.5px] font-semibold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

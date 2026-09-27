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

interface NewRequestFormProps {
  products: ProductOption[];
  initialProductId?: string;
  initialSubject?: string;
}

export function NewRequestForm({
  products,
  initialProductId = '',
  initialSubject = '',
}: NewRequestFormProps) {
  const router = useRouter();

  const [type, setType] = useState<DealerRequestType>(
    initialProductId ? 'AVAILABILITY' : 'PRODUCT_ENQUIRY'
  );
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/requests"
          className="inline-flex items-center text-[12.5px] font-semibold text-[#68665F] hover:text-[#171714] transition-colors mb-2"
        >
          ← Back to My Requests
        </Link>
        <h1 className="text-[24px] font-bold text-[#171714] tracking-tight">
          Raise New Request
        </h1>
        <p className="text-[13.5px] text-[#68665F] mt-1">
          Submit an inquiry, stock allocation request, or technical query directly to the Trionyx operations desk.
        </p>
      </div>

      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 shadow-[0_2px_8px_rgba(23,23,20,0.02)]">
        {error && (
          <div className="mb-6 p-4 rounded bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-bold uppercase tracking-wider text-[#68665F] mb-1.5">
                Request Type <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DealerRequestType)}
                className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
                required
              >
                <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
                <option value="AVAILABILITY">Stock / Allocation Request</option>
                <option value="GENERAL_SUPPORT">Technical / General Support</option>
                <option value="OTHER">Other Query</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-bold uppercase tracking-wider text-[#68665F] mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DealerRequestPriority)}
                className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
              >
                <option value="LOW">Low (Routine)</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="HIGH">High (Urgent customer need)</option>
                <option value="URGENT">Urgent (Critical requirement)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold uppercase tracking-wider text-[#68665F] mb-1.5">
              Related Product <span className="text-[#68665F] font-normal lowercase">(optional)</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] focus:outline-none focus:border-[#F26522]"
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
            <label className="block text-[12.5px] font-bold uppercase tracking-wider text-[#68665F] mb-1.5">
              Subject <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your request"
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522]"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold uppercase tracking-wider text-[#68665F] mb-1.5">
              Description <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Provide complete details, quantities required, vehicle application, or specific query..."
              className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522]"
              required
              minLength={5}
              maxLength={2000}
            />
            <span className="block text-[11px] text-[#68665F] text-right mt-1">
              {description.length} / 2000 characters
            </span>
          </div>

          <div className="pt-4 border-t border-[#171714]/08 flex items-center justify-end gap-3">
            <Link
              href="/requests"
              className="px-4 py-2 rounded border border-[#171714]/20 text-[13.5px] font-semibold text-[#171714] hover:bg-[#171714]/05 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-[#F26522] hover:bg-[#D9531E] text-white text-[13.5px] font-semibold shadow-[0_2px_8px_rgba(242,101,34,0.25)] disabled:opacity-50 transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

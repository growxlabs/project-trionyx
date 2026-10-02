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
    <div className="max-w-2xl space-y-6 text-[#171717]">
      <div>
        <Link
          href="/requests"
          className="text-[12.5px] font-semibold text-[#737373] hover:text-[#171717] inline-flex items-center gap-1 transition-colors mb-2"
        >
          ← Back to My Requests
        </Link>
        <h1 className="text-[26px] font-semibold tracking-[-0.03em] m-0">
          New Request
        </h1>
      </div>

      {error && (
        <div className="p-3.5 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-[#171717]/10 pt-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.14em] text-[#737373] mb-1.5">
              Request Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DealerRequestType)}
              className="w-full px-3 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13.5px] text-[#171717] focus:outline-none focus:border-[#F26522]"
              required
            >
              <option value="PRODUCT_ENQUIRY">Product Enquiry</option>
              <option value="AVAILABILITY">Stock Availability</option>
              <option value="GENERAL_SUPPORT">General Support</option>
              <option value="OTHER">Other Query</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.14em] text-[#737373] mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as DealerRequestPriority)}
              className="w-full px-3 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13.5px] text-[#171717] focus:outline-none focus:border-[#F26522]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-[#737373] mb-1.5">
            Product <span className="font-normal lowercase text-[#737373]/80">(optional)</span>
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13.5px] text-[#171717] focus:outline-none focus:border-[#F26522]"
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
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-[#737373] mb-1.5">
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your request"
            className="w-full px-3 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13.5px] text-[#171717] placeholder-[#737373]/50 focus:outline-none focus:border-[#F26522]"
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold tracking-[0.14em] text-[#737373] mb-1.5">
            Message *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide specific details, quantity requirements, or application questions..."
            rows={5}
            className="w-full px-3 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13.5px] text-[#171717] placeholder-[#737373]/50 focus:outline-none focus:border-[#F26522]"
            required
            minLength={5}
            maxLength={2000}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-[4px] bg-[#F26522] hover:opacity-90 disabled:opacity-50 text-white text-[13.5px] font-semibold transition-opacity cursor-pointer shadow-xs"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

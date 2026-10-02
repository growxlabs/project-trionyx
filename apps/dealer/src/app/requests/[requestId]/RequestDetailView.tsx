'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DealerRequest, DealerRequestMessage } from '@trionyx/types';
import { humanize } from '@/lib/format';

interface RequestDetailViewProps {
  request: DealerRequest;
  initialMessages: DealerRequestMessage[];
  currentUserId: string;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

export function RequestDetailView({
  request,
  initialMessages,
  currentUserId,
}: RequestDetailViewProps) {
  const [messages, setMessages] = useState<DealerRequestMessage[]>(initialMessages);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setReplyError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/dealer/requests/${request.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newReply.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post message');
      }

      setMessages((prev) => [...prev, data.message]);
      setNewReply('');
    } catch (err: any) {
      setReplyError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 text-[#171717]">
      {/* Back Link */}
      <div>
        <Link
          href="/requests"
          className="text-[12.5px] font-semibold text-[#737373] hover:text-[#171717] inline-flex items-center gap-1 transition-colors"
        >
          ← Back to My Requests
        </Link>
      </div>

      {/* Header Area */}
      <div className="space-y-1">
        <div className="font-mono text-[14px] font-bold text-[#F26522]">
          {request.requestCode}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-[2px] bg-[#171717]/05 text-[#171717]">
            {humanize(request.type)}
          </span>
          <span
            className={`text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-[2px] ${
              request.status === 'OPEN'
                ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                : request.status === 'IN_PROGRESS'
                ? 'bg-[#FFFBEB] text-[#B45309]'
                : 'bg-[#ECFDF5] text-[#065F46]'
            }`}
          >
            {humanize(request.status)}
          </span>
        </div>
        <h1 className="text-[22px] font-bold text-[#171717] tracking-tight pt-1 m-0">
          {request.subject}
        </h1>
        {request.productName && (
          <div className="text-[13.5px] text-[#737373]">
            {request.productId ? (
              <Link href={`/products/${request.productId}`} className="text-[#F26522] hover:underline font-medium">
                {request.productName}
              </Link>
            ) : (
              request.productName
            )}
          </div>
        )}
      </div>

      {/* Section 1: YOUR REQUEST */}
      <section aria-labelledby="your-request-heading" className="border-t border-[#171717]/10 pt-5 space-y-3">
        <h2 id="your-request-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
          YOUR REQUEST
        </h2>
        <div className="text-[12.5px] text-[#737373]">
          Submitted: {shortDateFormatter.format(new Date(request.createdAt))}
        </div>
        <div className="text-[13.5px] text-[#171717] leading-relaxed whitespace-pre-wrap">
          {request.description}
        </div>
      </section>

      {/* Section 2: STATUS */}
      <section aria-labelledby="request-status-heading" className="border-t border-[#171717]/10 pt-5 space-y-2 text-[13px]">
        <h2 id="request-status-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
          STATUS
        </h2>
        <div className="font-semibold text-[#171717]">
          {request.status === 'OPEN'
            ? 'Open — Pending review'
            : request.status === 'IN_PROGRESS'
            ? 'In Progress — Operational review underway'
            : request.status === 'RESOLVED'
            ? 'Resolved'
            : 'Closed'}
        </div>
        {request.resolvedAt && (
          <div className="text-[12px] text-[#065F46] font-medium">
            Resolved on {dateFormatter.format(new Date(request.resolvedAt))}
          </div>
        )}
      </section>

      {/* Section 3: UPDATES / CONVERSATION */}
      <section aria-labelledby="updates-heading" className="border-t border-[#171717]/10 pt-5 space-y-4">
        <h2 id="updates-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
          UPDATES
        </h2>

        <div className="space-y-4">
          {/* Initial creation entry */}
          <div className="text-[13px] border-l-2 border-[#171717]/15 pl-3 space-y-0.5">
            <div className="text-[11.5px] font-medium text-[#737373]">
              {shortDateFormatter.format(new Date(request.createdAt))}
            </div>
            <div className="font-medium text-[#171717]">
              Request created by dealership
            </div>
          </div>

          {/* Follow-up messages */}
          {messages.map((msg) => {
            const isDealer = msg.senderType === 'DEALER';
            const isCurrentUser = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`text-[13px] border-l-2 pl-3 py-1 space-y-1 ${
                  isDealer ? 'border-[#171717]/30' : 'border-[#F26522]'
                }`}
              >
                <div className="flex items-center justify-between text-[11.5px] text-[#737373]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#171717]">{msg.senderName}</span>
                    <span className="text-[10.5px]">
                      {isDealer ? (isCurrentUser ? '(You)' : '(Dealer Team)') : '(Trionyx Operations)'}
                    </span>
                  </div>
                  <span>{dateFormatter.format(new Date(msg.createdAt))}</span>
                </div>
                <div className="text-[#171717] whitespace-pre-wrap leading-relaxed">
                  {msg.body}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: ADD MESSAGE */}
      {request.status !== 'CLOSED' ? (
        <section aria-labelledby="add-message-heading" className="border-t border-[#171717]/10 pt-5 space-y-3">
          <h2 id="add-message-heading" className="text-[11px] font-semibold tracking-[0.14em] text-[#737373] m-0">
            ADD MESSAGE
          </h2>

          {replyError && (
            <div className="p-3 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[12.5px] text-[#B91C1C]">
              {replyError}
            </div>
          )}

          <form onSubmit={handlePostReply} className="space-y-3">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Enter message or additional query details..."
              rows={3}
              className="w-full px-3 py-2 rounded-[4px] border border-[#171717]/15 bg-white text-[13px] text-[#171717] placeholder-[#737373]/60 focus:border-[#F26522] focus:outline-none"
              required
            />
            <div>
              <button
                type="submit"
                disabled={submitting || !newReply.trim()}
                className="px-4 py-2 rounded-[4px] bg-[#171717] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-[13px] transition-opacity cursor-pointer shadow-xs"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="border-t border-[#171717]/10 pt-4 text-[12.5px] text-[#737373]">
          This request is closed. To raise a new inquiry, use &ldquo;New Request&rdquo;.
        </div>
      )}
    </div>
  );
}

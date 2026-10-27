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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            Open &amp; Pending
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Resolved
          </span>
        );
      case 'CLOSED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="px-2 py-0.5 rounded-[3px] text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            Medium Priority
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-neutral-50 text-neutral-500 border border-neutral-200">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Breadcrumbs */}
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

      {/* 2. Main Header Card */}
      <div className="bg-white border border-neutral-200 rounded-[8px] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] font-semibold text-[#F26522] bg-[#F26522]/08 px-2.5 py-0.5 rounded-[4px] border border-[#F26522]/20">
                {request.requestCode}
              </span>
              <span className="px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                {humanize(request.type)}
              </span>
              {getStatusBadge(request.status)}
              {request.priority && getPriorityBadge(request.priority)}
            </div>

            <h1 className="text-[22px] font-semibold text-[#171717] tracking-tight m-0 pt-1">
              {request.subject}
            </h1>
          </div>

          <div className="text-[12px] text-neutral-500 shrink-0 sm:text-right">
            <div>Submitted on</div>
            <div className="font-medium text-neutral-800">
              {dateFormatter.format(new Date(request.createdAt))}
            </div>
          </div>
        </div>

        {/* Associated Product Bar */}
        {request.productName && (
          <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-[12px]">Associated Product:</span>
              {request.productId ? (
                <Link
                  href={`/products/${request.productId}`}
                  className="font-medium text-[#F26522] hover:underline inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{request.productName}</span>
                  <span className="text-[11px]">↗</span>
                </Link>
              ) : (
                <span className="font-medium text-neutral-800">{request.productName}</span>
              )}
            </div>

            {request.resolvedAt && (
              <div className="inline-flex items-center gap-1 text-[12px] font-medium text-[#065F46] bg-[#ECFDF5] px-2.5 py-0.5 rounded border border-[#A7F3D0]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Resolved on {dateFormatter.format(new Date(request.resolvedAt))}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Brief Card */}
          <section className="bg-white rounded-[8px] border border-neutral-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#171717] m-0">
                Inquiry Brief &amp; Requirements
              </h2>
              <span className="text-[11.5px] text-neutral-500">
                Logged {shortDateFormatter.format(new Date(request.createdAt))}
              </span>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-200 rounded-[6px] p-4 text-[13.5px] text-[#171717] leading-relaxed whitespace-pre-wrap">
              {request.description}
            </div>
          </section>

          {/* Activity & Updates Thread */}
          <section className="bg-white rounded-[8px] border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#171717] m-0">
                Operational Updates &amp; Communications
              </h2>
              <span className="px-2 py-0.5 rounded-[4px] bg-neutral-100 text-neutral-600 text-[11px] font-medium border border-neutral-200">
                {messages.length + 1} {messages.length + 1 === 1 ? 'event' : 'events'}
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {/* Request Creation Milestone */}
              <div className="p-3.5 rounded-[6px] bg-neutral-50 border border-neutral-200 flex items-start gap-3 text-[13px]">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-700 font-bold text-[11px]">
                  DL
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#171717]">Request Logged</span>
                    <span className="text-[11.5px] text-neutral-500">
                      {dateFormatter.format(new Date(request.createdAt))}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-neutral-600 mt-0.5 m-0">
                    Inquiry submitted to regional distributor allocation queue.
                  </p>
                </div>
              </div>

              {/* Message Thread */}
              {messages.map((msg) => {
                const isDealer = msg.senderType === 'DEALER';
                const isCurrentUser = msg.senderId === currentUserId;

                if (!isDealer) {
                  // Trionyx Operations / Distributor message
                  return (
                    <div
                      key={msg.id}
                      className="p-4 rounded-[6px] bg-[#FFF8F5] border border-[#F26522]/25 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[12px] border-b border-[#F26522]/15 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#F26522] flex items-center justify-center text-white font-bold text-[10px]">
                            TX
                          </div>
                          <span className="font-semibold text-[#171717]">{msg.senderName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#F26522]/10 text-[#F26522] border border-[#F26522]/20 uppercase">
                            Trionyx Operations
                          </span>
                        </div>
                        <span className="text-neutral-500 text-[11.5px]">
                          {dateFormatter.format(new Date(msg.createdAt))}
                        </span>
                      </div>
                      <div className="text-[13.5px] text-[#171717] whitespace-pre-wrap leading-relaxed pl-8">
                        {msg.body}
                      </div>
                    </div>
                  );
                }

                // Dealership message
                return (
                  <div
                    key={msg.id}
                    className="p-4 rounded-[6px] bg-white border border-neutral-200 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[12px] border-b border-neutral-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold text-[10px]">
                          DL
                        </div>
                        <span className="font-semibold text-[#171717]">{msg.senderName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {isCurrentUser ? 'You (Dealership)' : 'Dealership Team'}
                        </span>
                      </div>
                      <span className="text-neutral-500 text-[11.5px]">
                        {dateFormatter.format(new Date(msg.createdAt))}
                      </span>
                    </div>
                    <div className="text-[13.5px] text-neutral-800 whitespace-pre-wrap leading-relaxed pl-8">
                      {msg.body}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Add Message Form */}
          {request.status !== 'CLOSED' ? (
            <section className="bg-white rounded-[8px] border border-neutral-200 p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[#171717] m-0">
                  Post a Follow-Up Message
                </h2>
                <p className="text-[12.5px] text-neutral-500 mt-1 m-0">
                  Provide supplementary requirements, delivery notes, or query details to your regional distributor.
                </p>
              </div>

              {replyError && (
                <div className="p-3.5 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[12.5px] text-[#B91C1C]">
                  {replyError}
                </div>
              )}

              <form onSubmit={handlePostReply} className="space-y-3">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Enter your message or inquiry update..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-[4px] border border-neutral-200 bg-white text-[13px] text-[#171717] placeholder-neutral-400 focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522]/20 focus:outline-none transition-colors"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !newReply.trim()}
                    className="px-4.5 py-2 rounded-[4px] bg-[#F26522] hover:bg-[#d9531e] disabled:opacity-50 text-white font-semibold text-[13px] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
                  >
                    <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <div className="p-4 rounded-[8px] bg-neutral-50 border border-neutral-200 text-[13px] text-neutral-600">
              This request is formally closed. To raise additional questions, please{' '}
              <Link href="/requests/new" className="text-[#F26522] font-semibold hover:underline">
                submit a new request
              </Link>
              .
            </div>
          )}
        </div>

        {/* Sidebar Column (1 col) */}
        <div className="space-y-6">
          {/* Status & Milestones Card */}
          <div className="bg-white rounded-[8px] border border-neutral-200 p-5 shadow-xs space-y-4">
            <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-neutral-500 m-0">
              Status &amp; Milestones
            </h3>

            <div className="space-y-3 text-[13px]">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-[#171717]">Submitted by Dealership</div>
                  <div className="text-[11.5px] text-neutral-500">
                    {shortDateFormatter.format(new Date(request.createdAt))}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    request.status === 'RESOLVED' || request.status === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {request.status === 'RESOLVED' || request.status === 'CLOSED' ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-[#171717]">
                    {request.status === 'RESOLVED' || request.status === 'CLOSED'
                      ? 'Operations Review Complete'
                      : 'Operational Handling'}
                  </div>
                  <div className="text-[11.5px] text-neutral-500">
                    {request.status === 'OPEN'
                      ? 'Pending review'
                      : 'Reviewed by regional distributor'}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    request.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-600'
                      : request.status === 'CLOSED'
                      ? 'bg-neutral-100 text-neutral-600'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {request.status === 'RESOLVED' ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-[#171717]">
                    {request.status === 'RESOLVED'
                      ? 'Resolved'
                      : request.status === 'CLOSED'
                      ? 'Closed'
                      : 'Resolution Pending'}
                  </div>
                  <div className="text-[11.5px] text-neutral-500">
                    {request.resolvedAt
                      ? dateFormatter.format(new Date(request.resolvedAt))
                      : 'Awaiting formal resolution'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="bg-white rounded-[8px] border border-neutral-200 p-5 shadow-xs space-y-3">
            <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-neutral-500 m-0">
              Request Metadata
            </h3>

            <dl className="divide-y divide-neutral-100 text-[12.5px] m-0">
              <div className="py-2 flex justify-between">
                <dt className="text-neutral-500">Request Code</dt>
                <dd className="font-mono font-medium text-neutral-800 m-0">{request.requestCode}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-neutral-500">Classification</dt>
                <dd className="font-medium text-neutral-800 m-0">{humanize(request.type)}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-neutral-500">Priority Level</dt>
                <dd className="font-medium text-neutral-800 m-0">{humanize(request.priority || 'MEDIUM')}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-neutral-500">Last Updated</dt>
                <dd className="text-neutral-800 m-0">{shortDateFormatter.format(new Date(request.updatedAt))}</dd>
              </div>
            </dl>
          </div>

          {/* Support Information Callout */}
          <div className="bg-neutral-50 rounded-[8px] border border-neutral-200 p-5 space-y-2 text-[12.5px]">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#F26522]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Urgent Stock or Dispatch?</span>
            </div>
            <p className="text-neutral-600 leading-relaxed m-0">
              Inquiries logged here route directly to your regional distributor and Trionyx HQ Operations. For urgent allocation, quote this request code on the dealer coordination line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

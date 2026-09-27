'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DealerRequest, DealerRequestMessage, DealerRequestStatus } from '@trionyx/types';

interface RequestDetailViewProps {
  request: DealerRequest;
  initialMessages: DealerRequestMessage[];
  currentUserId: string;
}

export function RequestDetailView({
  request,
  initialMessages,
  currentUserId,
}: RequestDetailViewProps) {
  const [messages, setMessages] = useState<DealerRequestMessage[]>(initialMessages);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const getStatusBadge = (status: DealerRequestStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            RESOLVED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11.5px] font-bold bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7]">
            CLOSED
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[12px] font-bold text-[#DC2626]">URGENT</span>;
      case 'HIGH':
        return <span className="text-[12px] font-semibold text-[#EA580C]">High</span>;
      case 'MEDIUM':
        return <span className="text-[12px] font-medium text-[#D97706]">Medium</span>;
      case 'LOW':
      default:
        return <span className="text-[12px] font-medium text-[#71717A]">Low</span>;
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          href="/requests"
          className="inline-flex items-center text-[12.5px] font-semibold text-[#68665F] hover:text-[#171714] transition-colors mb-2"
        >
          ← Back to My Requests
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12.5px] font-bold text-[#F26522]">
                {request.requestCode}
              </span>
              <span>•</span>
              <span className="text-[12px] text-[#68665F]">
                {new Date(request.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-[#171714] tracking-tight mt-1">
              {request.subject}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(request.status)}
          </div>
        </div>
      </div>

      {/* Main Request Meta & Details */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 shadow-[0_2px_8px_rgba(23,23,20,0.02)] space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded bg-[#EFECE3]/50 border border-[#171714]/08 text-[13px]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
              Type
            </span>
            <span className="font-medium text-[#171714] mt-0.5 block">
              {request.type.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
              Priority
            </span>
            <span className="mt-0.5 block">{getPriorityBadge(request.priority)}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
              Associated Product
            </span>
            <span className="font-medium text-[#171714] mt-0.5 block truncate">
              {request.productId ? (
                <Link
                  href={`/products/${request.productId}`}
                  className="text-[#F26522] hover:underline"
                >
                  {request.productName || 'View Product'}
                </Link>
              ) : (
                'None'
              )}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#68665F] block">
              Status
            </span>
            <span className="mt-0.5 block font-medium text-[#171714]">
              {request.status}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-[12.5px] font-bold uppercase tracking-wider text-[#68665F] mb-2">
            Description / Initial Query
          </h3>
          <div className="p-4 rounded bg-white border border-[#171714]/10 text-[13.5px] text-[#171714] leading-relaxed whitespace-pre-wrap">
            {request.description}
          </div>
        </div>

        {request.resolvedAt && (
          <div className="p-4 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[13px] text-[#065F46]">
            <span className="font-bold block">✓ Resolved</span>
            <p className="mt-0.5">
              This request was marked as resolved on{' '}
              {new Date(request.resolvedAt).toLocaleDateString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              .
            </p>
          </div>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 shadow-[0_2px_8px_rgba(23,23,20,0.02)] space-y-6">
        <div>
          <h2 className="text-[16px] font-bold text-[#171714] tracking-tight">
            Activity & Follow-ups
          </h2>
          <p className="text-[12.5px] text-[#68665F] mt-0.5">
            Direct messages between your dealership and Trionyx distribution operations.
          </p>
        </div>

        {/* Message List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="py-8 text-center text-[#68665F] text-[13px] border border-dashed border-[#171714]/15 rounded-lg">
              No replies yet. Trionyx operations will respond shortly.
            </div>
          ) : (
            messages.map((msg) => {
              const isDealer = msg.senderType === 'DEALER';
              const isCurrentUser = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border ${
                    isDealer
                      ? 'bg-white border-[#171714]/15 ml-4 sm:ml-8'
                      : 'bg-[#FFF8F4] border-[#F26522]/30 mr-4 sm:mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11.5px] mb-2 pb-1.5 border-b border-[#171714]/06">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#171714]">
                        {msg.senderName}
                      </span>
                      {isDealer ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EFECE3] text-[#68665F]">
                          {isCurrentUser ? 'You' : 'Dealer Team'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F26522] text-white">
                          Trionyx Operations
                        </span>
                      )}
                    </div>
                    <span className="text-[#68665F]">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-[#171714] whitespace-pre-wrap leading-relaxed">
                    {msg.body}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Post Reply Box */}
        {request.status !== 'CLOSED' ? (
          <form onSubmit={handlePostReply} className="pt-4 border-t border-[#171714]/08 space-y-3">
            {replyError && (
              <div className="p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-[12.5px] text-[#B91C1C]">
                {replyError}
              </div>
            )}
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#68665F] mb-1.5">
                Send a message / reply
              </label>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Type your message or clarification here..."
                rows={3}
                className="w-full px-3 py-2 rounded border border-[#171714]/20 bg-white text-[13.5px] text-[#171714] placeholder-[#68665F]/50 focus:outline-none focus:border-[#F26522]"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newReply.trim()}
                className="px-4 py-2 rounded bg-[#171714] hover:bg-black text-white text-[13px] font-semibold disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 rounded bg-[#F4F4F5] text-center text-[12.5px] text-[#71717A]">
            This request is closed. To discuss further, please raise a new request.
          </div>
        )}
      </div>
    </div>
  );
}

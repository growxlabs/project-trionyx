'use client';

import React from 'react';
import Link from 'next/link';
import type { SafeDealerUser, DealerWithRelations, DealerActivityItem } from '@trionyx/types';

interface OverviewViewProps {
  user: SafeDealerUser;
  dealer: DealerWithRelations;
  distributor: {
    id: string;
    distributorCode: string;
    businessName: string;
    city: string;
    state: string;
    contactPerson: string;
    phone: string;
  } | null;
  openRequestsCount: number;
  recentActivity: DealerActivityItem[];
}

export function OverviewView({
  user,
  dealer,
  distributor,
  openRequestsCount,
  recentActivity,
}: OverviewViewProps) {
  // Format greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 sm:p-8 shadow-[0_2px_12px_rgba(23,23,20,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#68665F] block">
              PARTNER OVERVIEW
            </span>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#171714] tracking-tight mt-1">
              {greeting}, {dealer.businessName}
            </h1>
            <p className="text-[14px] text-[#68665F] mt-1">
              Logged in as <span className="font-semibold text-[#171714]">{user.name}</span> ({user.email})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#171714] text-white font-semibold text-[13px] hover:bg-black transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Raise Request</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Account & Distributor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dealer Account Card */}
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#171714]/08 pb-3 mb-4">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#68665F]">
                DEALER ACCOUNT
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                {dealer.status}
              </span>
            </div>
            <h2 className="text-[18px] font-bold text-[#171714]">{dealer.businessName}</h2>
            <p className="text-[12px] font-mono text-[#68665F] mt-0.5">{dealer.dealerCode}</p>

            <div className="mt-4 space-y-2 text-[13px] text-[#171714]">
              <div className="flex items-center justify-between">
                <span className="text-[#68665F]">Primary Contact:</span>
                <span className="font-medium">{dealer.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68665F]">Phone:</span>
                <span className="font-mono">{dealer.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68665F]">Location:</span>
                <span>{dealer.city}, {dealer.state}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#171714]/08 flex justify-end">
            <Link
              href="/account"
              className="text-[12.5px] font-semibold text-[#F26522] hover:underline"
            >
              View Full Profile →
            </Link>
          </div>
        </div>

        {/* Assigned Distributor Card */}
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#171714]/08 pb-3 mb-4">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#68665F]">
                ASSIGNED REGIONAL DISTRIBUTOR
              </span>
              {distributor && (
                <span className="text-[11px] font-mono text-[#68665F]">{distributor.distributorCode}</span>
              )}
            </div>

            {distributor ? (
              <>
                <h2 className="text-[18px] font-bold text-[#171714]">{distributor.businessName}</h2>
                <div className="mt-4 space-y-2 text-[13px] text-[#171714]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#68665F]">Regional Hub:</span>
                    <span>{distributor.city}, {distributor.state}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#68665F]">Distribution Contact:</span>
                    <span className="font-medium">{distributor.contactPerson}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#68665F]">Support Phone:</span>
                    <span className="font-mono">{distributor.phone}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-[#68665F] text-[13.5px]">
                <p>No distributor currently assigned.</p>
                <p className="text-[12px] mt-1 text-[#68665F]/80">
                  Your requests are routed directly to Trionyx Operations.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-[#171714]/08 flex justify-end">
            <span className="text-[11.5px] text-[#68665F]">
              Direct wholesale fulfillment partner
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Requests & Availability Quick Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Open Requests Card */}
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#68665F] block mb-2">
            OPEN REQUESTS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#171714] leading-none">
              {openRequestsCount}
            </span>
            <span className="text-[13px] text-[#68665F]">in progress</span>
          </div>
          <p className="text-[12.5px] text-[#68665F] mt-2">
            Active product inquiries and availability requests under review.
          </p>
          <div className="mt-4 pt-3 border-t border-[#171714]/08">
            <Link
              href="/requests"
              className="text-[12.5px] font-semibold text-[#F26522] hover:underline"
            >
              Track Requests →
            </Link>
          </div>
        </div>

        {/* Product Availability Card */}
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#68665F] block mb-2">
            PRODUCT AVAILABILITY
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-bold text-[#171714] leading-tight">
              Live Stock Status
            </span>
          </div>
          <p className="text-[12.5px] text-[#68665F] mt-2">
            Check real-time ceramic coatings and detailing supplies ready for dispatch.
          </p>
          <div className="mt-4 pt-3 border-t border-[#171714]/08">
            <Link
              href="/availability"
              className="text-[12.5px] font-semibold text-[#F26522] hover:underline"
            >
              View Availability →
            </Link>
          </div>
        </div>

        {/* Product Catalog Card */}
        <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#68665F] block mb-2">
            TECHNICAL COLLATERALS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-bold text-[#171714] leading-tight">
              Approved Products
            </span>
          </div>
          <p className="text-[12.5px] text-[#68665F] mt-2">
            Review detailed formulations, application guidelines, and technical specifications.
          </p>
          <div className="mt-4 pt-3 border-t border-[#171714]/08">
            <Link
              href="/products"
              className="text-[12.5px] font-semibold text-[#F26522] hover:underline"
            >
              Browse Catalog →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-[#FCFBF7] border border-[#171714]/10 rounded-lg p-6">
        <h3 className="text-[14px] font-bold text-[#171714] mb-4">Recent Account Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-[#171714]/08">
            {recentActivity.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#F26522]" />
                  <span className="font-medium text-[#171714]">{item.description}</span>
                </div>
                <span className="text-[11.5px] text-[#68665F]">
                  {new Date(item.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#68665F] py-2">No recent activity.</p>
        )}
      </div>
    </div>
  );
}

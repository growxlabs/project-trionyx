'use client';

import React, { useState, useMemo } from 'react';
import type { Dealer } from '@trionyx/types';
import { humanize } from '@/lib/format';

interface DealersViewProps {
  initialDealers: Dealer[];
}

export function DealersView({ initialDealers }: DealersViewProps) {
  const [dealers] = useState<Dealer[]>(initialDealers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const matchName = d.businessName?.toLowerCase().includes(q) || false;
      const matchCode = d.dealerCode?.toLowerCase().includes(q) || false;
      const matchCity = d.city?.toLowerCase().includes(q) || false;
      const matchContact = d.contactPerson?.toLowerCase().includes(q) || false;

      return matchName || matchCode || matchCity || matchContact;
    });
  }, [dealers, search, statusFilter]);

  return (
    <div className="space-y-6 text-[#171717]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0">
            My Regional Dealers
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] bg-[#171717]/05 text-[#737373] px-2.5 py-1 rounded-[4px] border border-[#171717]/10 font-semibold">
            {dealers.length} Studios in Territory
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by studio name, code, contact or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#171717]/15 rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#F26522]"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-3 text-[#737373]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-[4px] text-[12.5px] font-medium border transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#171717] border-[#171717]/15 hover:border-[#171717]/30'
              }`}
            >
              {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Dealers List / Grid */}
      {filteredDealers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded border border-[#171717]/10">
          <svg className="w-12 h-12 mx-auto text-[#737373]/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div className="text-[15px] font-semibold text-[#171717]">No dealers found</div>
          <div className="text-[13px] text-[#737373] mt-1 max-w-sm mx-auto">
            {search ? 'Try adjusting your search terms.' : 'No regional dealer studios have been assigned to your territory yet.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDealers.map((d) => (
            <div
              key={d.id}
              className="bg-white p-5 rounded-[4px] border border-[#171717]/10 hover:border-[#F26522]/40 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold text-[#171717] m-0">{d.businessName}</h3>
                  <div className="text-[12px] text-[#737373] font-mono mt-0.5">{d.dealerCode}</div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-bold tracking-wider ${
                    d.status === 'ACTIVE'
                      ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                      : 'bg-[#F5F5F5] text-[#525252] border border-[#E0E0E0]'
                  }`}
                >
                  {humanize(d.status || 'Active')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12.5px] pt-2 border-t border-[#171717]/08">
                <div>
                  <span className="text-[#737373] block text-[11px]">Location</span>
                  <span className="font-medium text-[#171717]">{d.city}, {d.state}</span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[11px]">Contact Person</span>
                  <span className="font-medium text-[#171717]">{d.contactPerson || '—'}</span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[11px]">Phone</span>
                  <span className="font-medium text-[#171717]">{d.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[11px]">Email</span>
                  <span className="font-medium text-[#171717] truncate block">{d.email || '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

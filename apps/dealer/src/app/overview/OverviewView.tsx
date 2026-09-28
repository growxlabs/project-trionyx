import Link from 'next/link';
import type { DealerRequest, DealerWithRelations } from '@trionyx/types';

interface OverviewViewProps {
  dealer: DealerWithRelations;
  distributor: {
    distributorCode?: string;
    businessName: string;
    city: string;
    state: string;
    contactPerson: string;
    phone: string;
  } | null;
  openCount: number;
  inProgressCount: number;
  currentRequests: DealerRequest[];
  productCounts: { available: number; limited: number; unavailable: number };
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Kolkata',
});

export function OverviewView({
  dealer,
  distributor,
  openCount,
  inProgressCount,
  currentRequests,
  productCounts,
}: OverviewViewProps) {
  const totalActiveRequests = openCount + inProgressCount;

  return (
    <div className="space-y-8 text-[#171714]">
      {/* 1. Header Area with Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] m-0">
            Dealer Overview
          </h1>
          <div className="mt-2.5">
            <div className="text-[16px] font-semibold text-[#171714]">
              {dealer.businessName}
            </div>
            <div className="text-[13px] text-[#68665F] mt-0.5">
              {dealer.city}, {dealer.state}
            </div>
            <div className="text-[12px] font-mono font-medium text-[#68665F] mt-0.5">
              {dealer.dealerCode}
            </div>
          </div>
        </div>

        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-[4px] bg-[#F26522] hover:opacity-90 text-white font-semibold text-[13px] transition-opacity cursor-pointer self-start shadow-xs"
        >
          New Request
        </Link>
      </div>

      {/* 2. Needs Your Attention Summary Line (Section 5) */}
      <section aria-labelledby="attention-heading" className="border-y border-[#171714]/10 py-5">
        <h2 id="attention-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] mb-3 m-0">
          NEEDS YOUR ATTENTION
        </h2>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px]">
          <Link href="/requests" className="inline-flex items-baseline gap-2 hover:text-[#F26522] group">
            <span className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">Open Requests</span>
            <span className="font-mono font-bold text-[18px] text-[#171714] group-hover:text-[#F26522]">{totalActiveRequests}</span>
          </Link>
          <span className="text-[#171714]/20 hidden sm:inline">|</span>
          <Link href="/availability" className="inline-flex items-baseline gap-2 hover:text-[#F26522] group">
            <span className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">Limited Products</span>
            <span className="font-mono font-bold text-[18px] text-[#171714] group-hover:text-[#F26522]">{productCounts.limited}</span>
          </Link>
          <span className="text-[#171714]/20 hidden sm:inline">|</span>
          <Link href="/availability" className="inline-flex items-baseline gap-2 hover:text-[#F26522] group">
            <span className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">Unavailable</span>
            <span className="font-mono font-bold text-[18px] text-[#171714] group-hover:text-[#F26522]">{productCounts.unavailable}</span>
          </Link>
          <span className="text-[#171714]/20 hidden sm:inline">|</span>
          <Link href="/warranty" className="inline-flex items-baseline gap-2 hover:text-[#F26522] group">
            <span className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">Warranties Pending</span>
            <span className="font-mono font-bold text-[18px] text-[#171714] group-hover:text-[#F26522]">0</span>
          </Link>
        </div>
      </section>

      {/* 3. Main Operational Split: Current Requests vs Product Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12">
        {/* Current Requests */}
        <section aria-labelledby="requests-heading">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="requests-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
              CURRENT REQUESTS
            </h2>
            <Link href="/requests" className="text-[12px] font-semibold text-[#F26522] hover:underline">
              View all requests →
            </Link>
          </div>

          <div className="border-t border-[#171714]/10 divide-y divide-[#171714]/10">
            {currentRequests.length > 0 ? (
              currentRequests.map((req) => (
                <div key={req.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11.5px] font-semibold text-[#68665F]">
                      {req.requestCode}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[#171714]/05 text-[#171714]">
                      {req.status === 'OPEN' ? 'Open' : req.status === 'IN_PROGRESS' ? 'In Progress' : req.status}
                    </span>
                  </div>
                  <Link
                    href={`/requests/${req.id}`}
                    className="block font-semibold text-[14px] text-[#171714] hover:text-[#F26522] leading-snug"
                  >
                    {req.subject}
                  </Link>
                  {req.productName && (
                    <div className="text-[12px] text-[#68665F]">
                      {req.productName}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 text-[11.5px] text-[#68665F]">
                    <span>Updated {dateFormatter.format(new Date(req.updatedAt))}</span>
                    <Link
                      href={`/requests/${req.id}`}
                      className="font-medium text-[#F26522] hover:underline"
                    >
                      Open request →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-[13px] text-[#68665F]">
                No current requests. Use &ldquo;New Request&rdquo; to query stock or product support.
              </div>
            )}
          </div>
        </section>

        {/* Product Availability Summary */}
        <section aria-labelledby="availability-heading">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="availability-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
              PRODUCT AVAILABILITY
            </h2>
          </div>

          <div className="border-t border-[#171714]/10 divide-y divide-[#171714]/10 text-[13px]">
            <div className="flex items-center justify-between py-3">
              <span className="text-[#171714]">Available</span>
              <span className="font-mono font-semibold text-[#171714]">{productCounts.available}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[#171714]">Limited</span>
              <span className="font-mono font-semibold text-[#D97706]">{productCounts.limited}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[#171714]">Unavailable</span>
              <span className="font-mono font-semibold text-[#DC2626]">{productCounts.unavailable}</span>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/availability"
              className="text-[12.5px] font-semibold text-[#F26522] hover:underline inline-flex items-center gap-1"
            >
              Check availability →
            </Link>
          </div>
        </section>
      </div>

      {/* 4. Distributor Information Section */}
      <section aria-labelledby="distributor-heading" className="border-t border-[#171714]/10 pt-6">
        <h2 id="distributor-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] mb-3 m-0">
          YOUR DISTRIBUTOR
        </h2>

        {distributor ? (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-[13px]">
            <div>
              <div className="font-semibold text-[15px] text-[#171714]">
                {distributor.businessName}
              </div>
              <div className="text-[12.5px] text-[#68665F] mt-0.5">
                {distributor.city}, {distributor.state}
              </div>
              {distributor.distributorCode && (
                <div className="font-mono text-[11px] text-[#68665F] mt-0.5">
                  {distributor.distributorCode}
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <div className="font-medium text-[#171714]">{distributor.contactPerson}</div>
              <div className="text-[#68665F] mt-0.5">{distributor.phone}</div>
              <a
                href={`tel:${distributor.phone.replace(/[^+0-9]/g, '')}`}
                className="inline-block mt-2 font-semibold text-[12.5px] text-[#F26522] hover:underline cursor-pointer"
              >
                Call distributor →
              </a>
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-[#68665F]">
            No distributor is currently assigned to this account. Contact Trionyx Operations for territory allocation.
          </div>
        )}
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import type {
  DistributorWithRelations,
  DealerRequest,
  Dealer,
  SafeUser,
} from '@trionyx/types';

interface OverviewViewProps {
  distributor: DistributorWithRelations;
  user: SafeUser;
  openCount: number;
  inProgressCount: number;
  requestQueue: DealerRequest[];
  dealers: Dealer[];
  totalDealerCount: number;
  activeDealerCount: number;
  productCounts: {
    available: number;
    limited: number;
    unavailable: number;
  };
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
});

export function OverviewView({
  distributor,
  user,
  openCount,
  inProgressCount,
  requestQueue,
  dealers,
  totalDealerCount,
  activeDealerCount,
  productCounts,
}: OverviewViewProps) {
  const totalActiveRequests = openCount + inProgressCount;

  return (
    <div className="space-y-8 text-[#171714]">
      {/* SECTION 1: Distributor Identity and Code */}
      <section aria-labelledby="identity-heading" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-[#F26522] bg-[#F26522]/10 px-2 py-0.5 rounded-[2px] border border-[#F26522]/20">
                DISTRIBUTOR TERRITORY
              </span>
              <span className="font-mono text-[11px] text-[#68665F] font-semibold">
                {distributor.distributorCode}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-[2px] text-[9.5px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                {distributor.status || 'ACTIVE'}
              </span>
            </div>
            <h1 id="identity-heading" className="text-[26px] sm:text-[30px] font-bold tracking-[-0.03em] text-[#171714] mt-2 mb-0">
              {distributor.businessName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#68665F] mt-1.5 font-medium">
              <span>{distributor.city}, {distributor.state}</span>
              {distributor.territory && (
                <>
                  <span className="text-[#171714]/20">·</span>
                  <span>Territory: {distributor.territory}</span>
                </>
              )}
              {distributor.gstin && (
                <>
                  <span className="text-[#171714]/20">·</span>
                  <span className="font-mono text-[11.5px]">GSTIN: {distributor.gstin}</span>
                </>
              )}
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-[#FCFBF7] p-3 rounded border border-[#171714]/10 text-[12.5px]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68665F]">
              Primary Contact
            </div>
            <div className="font-semibold text-[#171714] mt-0.5">
              {distributor.contactPerson}
            </div>
            <div className="text-[#68665F] font-mono text-[11.5px]">
              {distributor.phone}
            </div>
            {distributor.email && (
              <div className="text-[#68665F] text-[11.5px]">
                {distributor.email}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Needs Attention */}
      <section aria-labelledby="attention-heading" className="border-y border-[#171714]/10 py-5 bg-[#FCFBF7] -mx-6 md:-mx-10 px-6 md:px-10">
        <div className="flex items-center justify-between mb-3">
          <h2 id="attention-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
            NEEDS ATTENTION
          </h2>
          <span className="text-[11.5px] font-mono text-[#68665F]">
            Territory Scope: {distributor.distributorCode}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/requests"
            className="p-3.5 rounded bg-white border border-[#171714]/10 hover:border-[#F26522] transition-colors group block"
          >
            <div className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">
              Open Requests
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`font-mono text-[22px] font-bold ${openCount > 0 ? 'text-[#F26522]' : 'text-[#171714]'}`}>
                {openCount}
              </span>
              <span className="text-[11.5px] text-[#68665F]">pending action</span>
            </div>
          </Link>

          <Link
            href="/requests"
            className="p-3.5 rounded bg-white border border-[#171714]/10 hover:border-[#171714]/30 transition-colors group block"
          >
            <div className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">
              In Progress
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-[22px] font-bold text-[#171714]">
                {inProgressCount}
              </span>
              <span className="text-[11.5px] text-[#68665F]">being resolved</span>
            </div>
          </Link>

          <Link
            href="/dealers"
            className="p-3.5 rounded bg-white border border-[#171714]/10 hover:border-[#171714]/30 transition-colors group block"
          >
            <div className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">
              Active Studios
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-[22px] font-bold text-[#065F46]">
                {activeDealerCount}
              </span>
              <span className="text-[11.5px] text-[#68665F]">of {totalDealerCount} assigned</span>
            </div>
          </Link>

          <Link
            href="/availability"
            className="p-3.5 rounded bg-white border border-[#171714]/10 hover:border-[#171714]/30 transition-colors group block"
          >
            <div className="text-[11px] uppercase tracking-wider text-[#68665F] font-semibold">
              Stock Watch
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-[22px] font-bold text-[#D97706]">
                {productCounts.limited}
              </span>
              <span className="text-[11.5px] text-[#68665F]">limited stock SKUs</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Grid: Request Queue vs Product Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* SECTION 3: Dealer Request Queue */}
        <section aria-labelledby="queue-heading" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 id="queue-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
                DEALER REQUEST QUEUE
              </h2>
              <p className="text-[12px] text-[#68665F] mt-0.5">
                Support, allocation and enquiry tickets from your assigned studios
              </p>
            </div>
            <Link href="/requests" className="text-[12px] font-semibold text-[#F26522] hover:underline">
              View all ({totalActiveRequests}) →
            </Link>
          </div>

          <div className="border border-[#171714]/10 rounded bg-white divide-y divide-[#171714]/10">
            {requestQueue.length > 0 ? (
              requestQueue.map((req) => (
                <div key={req.id} className="p-4 hover:bg-[#FCFBF7] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#68665F]">
                        {req.requestCode}
                      </span>
                      <span className="text-[#171714]/20">·</span>
                      <span className="text-[12px] font-semibold text-[#171714]">
                        {req.dealerName || 'Assigned Studio'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border ${
                          req.priority === 'URGENT'
                            ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                            : req.priority === 'HIGH'
                            ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                            : 'bg-[#F4F4F5] text-[#3F3F46] border-[#E4E4E7]'
                        }`}
                      >
                        {req.priority}
                      </span>
                      <span
                        className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border ${
                          req.status === 'OPEN'
                            ? 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                            : req.status === 'IN_PROGRESS'
                            ? 'bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]'
                            : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/requests/${req.id}`}
                    className="block font-semibold text-[13.5px] text-[#171714] hover:text-[#F26522] leading-snug"
                  >
                    {req.subject}
                  </Link>

                  {req.productName && (
                    <div className="text-[11.5px] text-[#68665F]">
                      Target SKU: <span className="text-[#171714] font-medium">{req.productName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#68665F]">
                    <span>Updated {dateFormatter.format(new Date(req.updatedAt))}</span>
                    <Link
                      href={`/requests/${req.id}`}
                      className="font-semibold text-[#F26522] hover:underline"
                    >
                      Open ticket →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[13px] text-[#68665F]">
                <p className="font-semibold text-[#171714]">No open dealer requests</p>
                <p className="text-[12px] mt-1 text-[#68665F]">
                  Requests raised by your assigned detail studios will appear here in real time.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5: Product Availability */}
        <section aria-labelledby="avail-heading" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 id="avail-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
              PRODUCT AVAILABILITY
            </h2>
            <Link href="/availability" className="text-[12px] font-semibold text-[#F26522] hover:underline">
              Full Matrix →
            </Link>
          </div>

          <div className="border border-[#171714]/10 rounded bg-white p-5 space-y-4">
            <div className="divide-y divide-[#171714]/10 text-[13px]">
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-[#171714] font-medium">Standard Allocation Available</span>
                </div>
                <span className="font-mono font-bold text-[#171714]">{productCounts.available}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#171714] font-medium">Limited / High Demand</span>
                </div>
                <span className="font-mono font-bold text-[#D97706]">{productCounts.limited}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span className="text-[#171714] font-medium">Backorder / Restock Pending</span>
                </div>
                <span className="font-mono font-bold text-[#DC2626]">{productCounts.unavailable}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#171714]/10">
              <Link
                href="/availability"
                className="w-full text-center py-2 px-3 rounded bg-[#171714]/05 hover:bg-[#171714]/10 text-[#171714] font-semibold text-[12.5px] block transition-colors"
              >
                Inspect Catalog Availability Matrix
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 4: My Dealer Network */}
      <section aria-labelledby="network-heading" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 id="network-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
              MY DEALER NETWORK
            </h2>
            <p className="text-[12px] text-[#68665F] mt-0.5">
              Authorized detail studios and workshops assigned to your distribution territory
            </p>
          </div>
          <Link href="/dealers" className="text-[12px] font-semibold text-[#F26522] hover:underline">
            View all ({totalDealerCount}) →
          </Link>
        </div>

        <div className="border border-[#171714]/10 rounded bg-white overflow-hidden">
          {dealers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[#171714]/10 bg-[#FCFBF7] text-[11px] font-semibold uppercase tracking-wider text-[#68665F]">
                    <th className="py-2.5 px-4">Studio / Dealer</th>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171714]/10">
                  {dealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-[#FCFBF7] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#171714]">
                        {dealer.businessName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11.5px] text-[#68665F]">
                        {dealer.dealerCode}
                      </td>
                      <td className="py-3 px-4 text-[#68665F]">
                        {dealer.city}, {dealer.state}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#171714] text-[12.5px]">{dealer.contactPerson}</div>
                        <div className="font-mono text-[11px] text-[#68665F]">{dealer.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.2 rounded-[2px] text-[9.5px] font-bold uppercase tracking-wider border ${
                            dealer.status === 'ACTIVE'
                              ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                              : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                          }`}
                        >
                          {dealer.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dealers/${dealer.id}`}
                          className="text-[12px] font-semibold text-[#F26522] hover:underline"
                        >
                          View Studio →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-[13px] text-[#68665F]">
              <p className="font-semibold text-[#171714]">No studios currently assigned</p>
              <p className="text-[12px] mt-1 text-[#68665F]">
                Studios mapped to your territory will be visible here once registered by Trionyx Operations HQ.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 6: Recent Operations */}
      <section aria-labelledby="operations-heading" className="space-y-3">
        <h2 id="operations-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F] m-0">
          RECENT OPERATIONS & DISPATCH
        </h2>

        <div className="border border-[#171714]/10 rounded bg-[#FCFBF7] p-4 text-[13px] space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#68665F] font-semibold border-b border-[#171714]/10 pb-2">
            <span>OPERATIONAL EVENT</span>
            <span>TERRITORY DISPATCH STATUS</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[12.5px]">
              <div>
                <span className="font-semibold text-[#171714]">Territory Network Active:</span>{' '}
                <span className="text-[#68665F]">
                  {activeDealerCount} authorized detailing studios operational in {distributor.city} / {distributor.state}.
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#065F46] font-semibold shrink-0">
                ACTIVE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[12.5px]">
              <div>
                <span className="font-semibold text-[#171714]">Serial & Product Dispatch Channel:</span>{' '}
                <span className="text-[#68665F]">
                  Stock allocations ready for direct fulfillment from regional hub.
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#68665F] font-semibold shrink-0">
                READY
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[12.5px]">
              <div>
                <span className="font-semibold text-[#171714]">Active Session:</span>{' '}
                <span className="text-[#68665F]">
                  Authenticated as {user.name} ({user.role}) for {distributor.distributorCode}.
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#68665F] shrink-0">
                {dateFormatter.format(new Date())} · {timeFormatter.format(new Date())}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import type {
  DistributorWithRelations,
  DealerRequest,
  Dealer,
} from '@trionyx/types';
import { MaskIcon } from '@/components/ui/MaskIcon';
import { humanize } from '@/lib/format';

interface OverviewViewProps {
  distributor: DistributorWithRelations;
  openCount: number;
  inProgressCount: number;
  requestQueue: DealerRequest[];
  dealers: Dealer[];
  totalDealerCount: number;
  productCounts: {
    available: number;
    limited: number;
    unavailable: number;
  };
}

function SectionLabel({
  index,
  title,
  href,
  actionLabel,
}: {
  index: string;
  title: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <span className="text-[12px] font-semibold text-[#F26522]">{index}</span>
        <h2 className="m-0 text-[14px] font-semibold tracking-tight text-[#171717]">
          {title}
        </h2>
      </div>
      {href && actionLabel && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#737373] transition-colors hover:text-[#F26522]"
        >
          {actionLabel}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}

function EmptyState({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <MaskIcon src={icon} className="h-11 w-11 text-[#171717]/15" />
      <p className="m-0 text-[14px] font-medium text-[#737373]">{title}</p>
    </div>
  );
}

export function OverviewView({
  distributor,
  openCount,
  inProgressCount,
  requestQueue,
  dealers,
  totalDealerCount,
  productCounts,
}: OverviewViewProps) {
  const totalActiveRequests = openCount + inProgressCount;

  const availability = [
    { label: 'Standard Allocation', dot: 'bg-[#10B981]', value: productCounts.available },
    { label: 'Limited / High Demand', dot: 'bg-[#F59E0B]', value: productCounts.limited },
    { label: 'Backorder / Restock', dot: 'bg-[#EF4444]', value: productCounts.unavailable },
  ];

  return (
    <div className="space-y-12 text-[#171717]">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-[8px] border border-[#171717]/10 bg-[#FFFFFF]">
        <div className="ops-hero-grid ops-hero-fade pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-12 -top-20 text-[#171717]">
          <MaskIcon src="/icons/overview.svg" className="h-80 w-80 opacity-[0.035]" />
        </div>

        <div className="relative px-6 py-9 sm:px-10 sm:py-14">
          <div className="flex items-center gap-2.5 text-[11px] font-semibold tracking-wide text-[#737373]">
            <span>{distributor.distributorCode}</span>
          </div>

          <h1 className="mt-5 max-w-3xl text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#171717] sm:text-[48px]">
            {distributor.businessName}
          </h1>

          {distributor.gstin && (
            <div className="mt-6 text-[12px] text-[#737373]">
              GSTIN · {distributor.gstin}
            </div>
          )}
        </div>

        <div className="relative h-px w-full bg-[#171717]/10">
          <span className="absolute left-0 top-0 h-px w-20 bg-[#F26522]" />
        </div>
      </header>

      {/* Queue + Availability */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr]">
        <section className="flex flex-col gap-4">
          <SectionLabel
            index="01"
            title="Dealer Request Queue"
            href="/requests"
            actionLabel={`View all (${totalActiveRequests})`}
          />
          <div className="overflow-hidden rounded-[8px] border border-[#171717]/10 bg-[#FFFFFF]">
            {requestQueue.length > 0 ? (
              <div className="divide-y divide-[#171717]/10">
                {requestQueue.map((req) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#F5F5F5]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 text-[11.5px] text-[#737373]">
                        <span className="font-semibold">{req.requestCode}</span>
                        <span className="text-[#171717]/20">·</span>
                        <span className="truncate">{req.dealerName || 'Assigned Studio'}</span>
                      </div>
                      <div className="mt-1 truncate text-[14px] font-medium text-[#171717] transition-colors group-hover:text-[#F26522]">
                        {req.subject}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold ${
                        req.status === 'OPEN'
                          ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]'
                          : req.status === 'IN_PROGRESS'
                          ? 'border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6]'
                          : 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]'
                      }`}
                    >
                      {humanize(req.status)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="/icons/requests.svg" title="No open dealer requests" />
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel
            index="02"
            title="Product Availability"
            href="/availability"
            actionLabel="Full matrix"
          />
          <div className="divide-y divide-[#171717]/10 rounded-[8px] border border-[#171717]/10 bg-[#FFFFFF] px-6">
            {availability.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                  <span className="text-[13.5px] font-medium text-[#171717]">{row.label}</span>
                </div>
                <span className="text-[26px] font-semibold leading-none tabular-nums text-[#171717]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Network */}
      <section className="flex flex-col gap-4">
        <SectionLabel
          index="03"
          title="My Dealer Network"
          href="/dealers"
          actionLabel={`View all (${totalDealerCount})`}
        />
        <div className="overflow-hidden rounded-[8px] border border-[#171717]/10 bg-[#FFFFFF]">
          {dealers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#171717]/10 text-[12px] font-medium text-[#737373]">
                    <th className="px-6 py-3 font-semibold">Studio / Dealer</th>
                    <th className="px-6 py-3 font-semibold">Code</th>
                    <th className="px-6 py-3 font-semibold">Location</th>
                    <th className="px-6 py-3 font-semibold">Contact</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/10">
                  {dealers.map((dealer) => (
                    <tr key={dealer.id} className="transition-colors hover:bg-[#F5F5F5]">
                      <td className="px-6 py-3.5 font-semibold text-[#171717]">
                        <Link href={`/dealers/${dealer.id}`} className="hover:text-[#F26522]">
                          {dealer.businessName}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-[#737373]">
                        {dealer.dealerCode}
                      </td>
                      <td className="px-6 py-3.5 text-[#737373]">
                        {dealer.city}, {dealer.state}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-[12.5px] font-medium text-[#171717]">
                          {dealer.contactPerson}
                        </div>
                        <div className="text-[11.5px] text-[#737373]">{dealer.phone}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold ${
                            dealer.status === 'ACTIVE'
                              ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]'
                              : 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
                          }`}
                        >
                          {humanize(dealer.status || 'ACTIVE')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon="/icons/dealers.svg" title="No studios currently assigned" />
          )}
        </div>
      </section>
    </div>
  );
}

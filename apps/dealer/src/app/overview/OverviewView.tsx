import Link from 'next/link';
import type { DealerRequest, DealerWithRelations } from '@trionyx/types';

interface OverviewViewProps {
  dealer: DealerWithRelations;
  distributor: {
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
  year: 'numeric',
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
  return (
    <div className="mx-auto max-w-[1260px] text-[#171714]">
      <header className="flex flex-col gap-5 border-b border-[#171714]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.035em] sm:text-[38px]">Dealer overview</h1>
          <p className="mt-2 text-[14px] text-[#68665F] md:hidden">{dealer.businessName}</p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex min-h-11 items-center justify-center rounded bg-[#171714] px-5 text-[13px] font-semibold text-[#FCFBF7] transition-opacity hover:opacity-85"
        >
          New request
        </Link>
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)] lg:gap-12">
        <section aria-labelledby="current-requests-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="current-requests-heading" className="text-[23px] font-semibold tracking-[-0.025em]">Current requests</h2>
            </div>
            <Link href="/requests" className="text-[13px] font-semibold text-[#F26522] hover:underline">
              View all requests →
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-y border-[#171714]/10 py-3 text-[12px] text-[#68665F]">
            <span><strong className="font-semibold text-[#171714]">{openCount}</strong> open</span>
            <span><strong className="font-semibold text-[#171714]">{inProgressCount}</strong> in progress</span>
          </div>

          {currentRequests.length > 0 ? (
            <ul className="divide-y divide-[#171714]/10">
              {currentRequests.map((request) => (
                <li key={request.id} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5">
                  <div className="min-w-0">
                    <Link
                      href={`/requests/${request.id}`}
                      className="text-[15px] font-semibold leading-snug hover:text-[#F26522] hover:underline"
                    >
                      {request.subject}
                    </Link>
                    <p className="mt-1 text-[12px] text-[#68665F]">
                      {request.requestCode}{request.productName ? ` · ${request.productName}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] sm:flex-col sm:items-end sm:gap-1">
                    <span className="font-semibold text-[#171714]">
                      {request.status === 'OPEN' ? 'Open' : 'In progress'}
                    </span>
                    <time className="text-[#68665F]" dateTime={request.updatedAt}>
                      Updated {dateFormatter.format(new Date(request.updatedAt))}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-b border-[#171714]/10 py-9">
              <p className="text-[15px] font-medium">No current requests.</p>
              <p className="mt-1 text-[13px] text-[#68665F]">Ask about a product or stock availability when you need help.</p>
            </div>
          )}
        </section>

        <aside className="space-y-9" aria-label="Dealer tools and contacts">
          <section aria-labelledby="availability-heading" className="border-t border-[#171714]/10 pt-4">
            <h2 id="availability-heading" className="text-[20px] font-semibold tracking-[-0.02em]">Product availability</h2>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-[#171714]/10 py-4 text-center">
              <div><dt className="text-[11px] text-[#68665F]">Available</dt><dd className="mt-1 text-[20px] font-semibold">{productCounts.available}</dd></div>
              <div><dt className="text-[11px] text-[#68665F]">Limited</dt><dd className="mt-1 text-[20px] font-semibold">{productCounts.limited}</dd></div>
              <div><dt className="text-[11px] text-[#68665F]">Unavailable</dt><dd className="mt-1 text-[20px] font-semibold">{productCounts.unavailable}</dd></div>
            </dl>
            <Link href="/availability" className="mt-3 inline-block text-[13px] font-semibold text-[#F26522] hover:underline">
              Check product availability →
            </Link>
          </section>

          <section aria-labelledby="distributor-heading" className="border-t border-[#171714]/10 pt-4">
            <h2 id="distributor-heading" className="text-[20px] font-semibold tracking-[-0.02em]">Distributor contact</h2>
            {distributor ? (
              <div className="mt-3 text-[13px]">
                <p className="text-[15px] font-semibold">{distributor.businessName}</p>
                <p className="mt-1 text-[#68665F]">{distributor.city}, {distributor.state}</p>
                <p className="mt-4">{distributor.contactPerson}</p>
                <a href={`tel:${distributor.phone.replace(/[^+0-9]/g, '')}`} className="mt-1 inline-block font-semibold text-[#F26522] hover:underline">
                  {distributor.phone}
                </a>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-[#68665F]">No distributor is assigned to this account.</p>
            )}
          </section>

        </aside>
      </div>
    </div>
  );
}

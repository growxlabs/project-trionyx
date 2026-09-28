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
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[36px]">Dealer overview</h1>
          <p className="mt-3 text-[17px] font-semibold">{dealer.businessName}</p>
          <p className="mt-1 text-[13px] text-[#68665F]">{dealer.city}, {dealer.state} · {dealer.dealerCode}</p>
        </div>
        <Link href="/requests/new" className="inline-flex min-h-11 items-center rounded bg-[#171714] px-5 text-[13px] font-semibold text-[#FCFBF7] hover:opacity-85">
          New request
        </Link>
      </header>

      <section aria-labelledby="attention-heading" className="mt-8 border-y border-[#171714]/10 py-5">
        <h2 id="attention-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F]">Needs your attention</h2>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
          <Link href="/requests" className="hover:text-[#F26522] hover:underline"><strong className="text-[20px] font-semibold">{openCount + inProgressCount}</strong> current requests</Link>
          <Link href="/availability" className="hover:text-[#F26522] hover:underline"><strong className="text-[20px] font-semibold">{productCounts.limited}</strong> products limited</Link>
          <Link href="/availability" className="hover:text-[#F26522] hover:underline"><strong className="text-[20px] font-semibold">{productCounts.unavailable}</strong> products unavailable</Link>
        </div>
      </section>

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] lg:gap-12">
        <section aria-labelledby="requests-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="requests-heading" className="text-[20px] font-semibold">Current requests</h2>
            <Link href="/requests" className="text-[13px] font-semibold text-[#F26522] hover:underline">View all requests →</Link>
          </div>
          <div className="mt-4 border-t border-[#171714]/10">
            {currentRequests.length > 0 ? (
              <ul className="divide-y divide-[#171714]/10">
                {currentRequests.map((request) => (
                  <li key={request.id} className="py-4">
                    <p className="text-[11px] font-semibold tracking-wider text-[#68665F]">{request.requestCode}</p>
                    <Link href={`/requests/${request.id}`} className="mt-1 block text-[15px] font-semibold hover:text-[#F26522] hover:underline">{request.subject}</Link>
                    {request.productName && <p className="mt-1 text-[13px] text-[#68665F]">{request.productName}</p>}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#68665F]">
                      <span className="font-semibold text-[#171714]">{request.status === 'OPEN' ? 'Open' : 'In progress'}</span>
                      <time dateTime={request.updatedAt}>Updated {dateFormatter.format(new Date(request.updatedAt))}</time>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="py-6 text-[13px] text-[#68665F]">No current requests.</p>}
          </div>
        </section>

        <section aria-labelledby="availability-heading">
          <h2 id="availability-heading" className="text-[20px] font-semibold">Product availability</h2>
          <dl className="mt-4 border-t border-[#171714]/10 text-[13px]">
            <div className="flex justify-between border-b border-[#171714]/10 py-3"><dt>Available</dt><dd className="font-semibold">{productCounts.available}</dd></div>
            <div className="flex justify-between border-b border-[#171714]/10 py-3"><dt>Limited</dt><dd className="font-semibold">{productCounts.limited}</dd></div>
            <div className="flex justify-between border-b border-[#171714]/10 py-3"><dt>Unavailable</dt><dd className="font-semibold">{productCounts.unavailable}</dd></div>
          </dl>
          <Link href="/availability" className="mt-4 inline-block text-[13px] font-semibold text-[#F26522] hover:underline">Check availability →</Link>
        </section>
      </div>

      <section aria-labelledby="distributor-heading" className="border-t border-[#171714]/10 pt-6">
        <h2 id="distributor-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#68665F]">Your distributor</h2>
        {distributor ? (
          <div className="mt-3 flex flex-wrap justify-between gap-5">
            <div>
              <p className="text-[16px] font-semibold">{distributor.businessName}</p>
              <p className="mt-1 text-[13px] text-[#68665F]">{distributor.city}, {distributor.state}</p>
            </div>
            <div className="text-[13px]">
              <p>{distributor.contactPerson}</p>
              <a href={`tel:${distributor.phone.replace(/[^+0-9]/g, '')}`} className="mt-1 block font-semibold text-[#F26522] hover:underline">Call {distributor.phone}</a>
            </div>
          </div>
        ) : <p className="mt-3 text-[13px] text-[#68665F]">No distributor is assigned to this account.</p>}
      </section>
    </div>
  );
}

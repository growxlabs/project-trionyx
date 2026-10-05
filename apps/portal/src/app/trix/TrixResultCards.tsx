import React from 'react';
import Link from 'next/link';
import type { TrixResponse } from '@trionyx/ai/responses';
import { StatusBadge } from '../../components/workspace/StatusBadge';
import { TrixJsonRenderer } from '../../components/json-render/TrixJsonRenderer';
import styles from './TrixConversation.module.css';

/** Every typed tool result except plain messages and prepared actions, which the conversation renders itself. */
export type ResultResponse = Exclude<TrixResponse, { type: 'message' } | { type: 'prepared_action' }>;

type Row = { key: string; title: string; subtitle?: string; detail?: string; status?: string; href?: string };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className={styles.card}><h2>{title}</h2>{children}</section>;
}
function Counts({ total, groups }: { total: number; groups: { key: string; label: string; count: number }[] }) {
  return <>
    <p className={styles.cardTotal}>Total {total}</p>
    <ul className={styles.rows}>{groups.map(group => <li key={group.key} className={styles.countRow}><span>{group.label}</span><span>{group.count}</span></li>)}</ul>
  </>;
}
function Rows({ rows, empty }: { rows: Row[]; empty: string }) {
  if (!rows.length) return <p className={styles.muted}>{empty}</p>;
  return <ul className={styles.rows}>{rows.map(row => <li key={row.key} className={styles.row}>
    <div className={styles.rowMain}>
      {row.href ? <Link href={row.href} className={styles.rowTitle}>{row.title}</Link> : <span className={styles.rowTitle}>{row.title}</span>}
      {row.status && <StatusBadge status={row.status} />}
    </div>
    {row.subtitle && <p className={styles.rowSub}>{row.subtitle}</p>}
    {row.detail && <p className={styles.rowSub}>{row.detail}</p>}
  </li>)}</ul>;
}
function Fields({ fields }: { fields: [string, React.ReactNode][] }) {
  return <dl className={styles.fields}>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
const of = (shown: number, total: number) => shown === total ? `${total}` : `${shown} of ${total}`;
const path = (base: string, id: string) => `${base}/${encodeURIComponent(id)}`;
const place = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(', ');
const words = (value: string) => value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, letter => letter.toUpperCase());
const change = (from: string | null, to: string | null) => `${from ?? 'None'} → ${to ?? 'None'}`;
function age(minutes: number) {
  if (minutes < 60) return `${minutes} min old`;
  const hours = Math.floor(minutes / 60);
  return hours < 48 ? `${hours} h old` : `${Math.floor(hours / 24)} days old`;
}
export function formatDateTime(value: string) {
  const date = new Date(value); if (Number.isNaN(date.getTime())) return 'Not recorded';
  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return day;
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(date);
  return `${day} · ${time}`;
}

export function TrixResultCard({ response }: { response: ResultResponse }) {
  return <TrixJsonRenderer response={response} />;
}

export function LegacyTrixResultCard({ response }: { response: ResultResponse }) {
  switch (response.type) {
    case 'inventory_list':
      return <Card title={`Inventory serials (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No serials match." rows={response.items.map(item => ({ key: item.id, title: item.serialNumber, href: path('/inventory/serials', item.id), status: item.status,
          subtitle: `${item.product.name} · ${item.location?.name ?? 'No location'}` }))} />
      </Card>;
    case 'inventory_summary':
      return <Card title={`Inventory by ${response.groupBy}`}><Counts total={response.total} groups={response.groups} /></Card>;
    case 'serial_movements':
      return <Card title={`Serial movements (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No movements in this window." rows={response.items.map(item => ({ key: item.id, title: item.serialNumber, href: path('/inventory/serials', item.serialId), status: item.movementType,
          subtitle: `${item.fromLocationName ? `${item.fromLocationName} → ` : ''}${item.toLocationName ?? 'No location'} · ${formatDateTime(item.occurredAt)}` }))} />
      </Card>;
    case 'inventory_exceptions':
      return <Card title={`Inventory exceptions (${response.totalExceptions})`}>
        <Rows empty="No inventory exceptions found." rows={response.items.map((item, index) => ({ key: `${item.recordId}-${index}`, title: item.label, status: item.severity, subtitle: item.description }))} />
      </Card>;
    case 'dealer_list':
      return <Card title={`Dealers (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No dealers match." rows={response.items.map(item => ({ key: item.id, title: item.businessName, href: path('/dealers', item.id), status: item.status,
          subtitle: `${item.dealerCode} · ${place(item.city, item.state)}`, detail: `Distributor: ${item.assignedDistributor?.businessName ?? 'Unassigned'}` }))} />
      </Card>;
    case 'distributor_list':
      return <Card title={`Distributors (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No distributors match." rows={response.items.map(item => ({ key: item.id, title: item.businessName, href: path('/distributors', item.id), status: item.status,
          subtitle: `${item.distributorCode} · ${place(item.city, item.state)}`, detail: `${item.dealerCount} ${item.dealerCount === 1 ? 'dealer' : 'dealers'}` }))} />
      </Card>;
    case 'dealer_network_summary':
      return <Card title={`Dealers by ${words(response.groupBy)}`}>
        <p className={styles.muted}>{response.totalDistributors} distributors</p>
        <Counts total={response.totalDealers} groups={response.groups} />
      </Card>;
    case 'dealer_assignment_history':
      return <Card title={`Distributor assignments (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No assignment changes recorded." rows={response.items.map(item => ({ key: item.id, title: item.dealerName, href: path('/dealers', item.dealerId),
          subtitle: change(item.previousDistributorName, item.newDistributorName), detail: formatDateTime(item.changedAt) }))} />
      </Card>;
    case 'dealer_network_exceptions':
      return <Card title={`Dealer network attention (${response.totalExceptions})`}>
        <Rows empty="No dealer network conditions need attention." rows={response.items.map(item => ({ key: `${item.recordId}-${item.type}`, title: item.label, href: path('/dealers', item.recordId), status: item.severity, subtitle: item.description }))} />
      </Card>;
    case 'enquiry_list':
      return <Card title={`Enquiries (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No enquiries match." rows={response.items.map(item => ({ key: item.id, title: `${item.enquiryCode} · ${item.fullName}`, href: path('/enquiries', item.id), status: item.status,
          subtitle: `${words(item.type)} · ${place(item.city, item.state)}`, detail: `${item.owner?.displayName ?? 'Unassigned'} · ${age(item.ageMinutes)}` }))} />
      </Card>;
    case 'enquiry_detail': {
      const enquiry = response.enquiry;
      return <Card title={enquiry.enquiryCode}>
        <div className={styles.productRow}><p>{enquiry.fullName}{enquiry.companyName ? ` · ${enquiry.companyName}` : ''}</p><StatusBadge status={enquiry.status} /></div>
        <Fields fields={[['Type', words(enquiry.type)], ['Owner', enquiry.owner?.displayName ?? 'Unassigned'], ['Phone', enquiry.phone], ['Email', enquiry.email ?? 'Not provided'],
          ['Location', place(enquiry.city, enquiry.state, enquiry.pincode)], ['Received', formatDateTime(enquiry.createdAt)]]} />
        {/* Stored customer text: rendered as plain text only. */}
        <p className={styles.storedMessage}>{enquiry.message}{enquiry.messageTruncated ? '…' : ''}</p>
        <Link href={path('/enquiries', enquiry.id)} className={styles.recordAction}>Open enquiry</Link>
      </Card>;
    }
    case 'enquiry_summary':
      return <Card title={`Enquiries by ${words(response.groupBy)}`}><Counts total={response.total} groups={response.groups} /></Card>;
    case 'enquiry_attention':
      return <Card title={`Enquiries needing attention (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No enquiries need attention." rows={response.items.map(item => ({ key: `${item.enquiryId}-${item.rule}`, title: `${item.enquiryCode} · ${item.label}`, href: path('/enquiries', item.enquiryId),
          status: item.severity, subtitle: item.description, detail: age(item.ageMinutes) }))} />
      </Card>;
    case 'enquiry_changes':
      return <Card title={`Enquiry changes (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No enquiry changes recorded." rows={response.items.map(item => ({ key: item.id, title: `${item.enquiryCode} · ${words(item.changeType)}`, href: path('/enquiries', item.enquiryId),
          subtitle: item.previousValue || item.newValue ? change(item.previousValue, item.newValue) : undefined, detail: formatDateTime(item.occurredAt) }))} />
      </Card>;
    case 'warranty_list':
      return <Card title={`Warranties (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No warranties match." rows={response.items.map(item => ({ key: item.warrantyId, title: item.serialNumber, href: path('/warranty', item.warrantyId), status: item.status,
          subtitle: `${item.productName} · ${item.dealerName ?? 'No dealer'}`, detail: `${formatDateTime(item.startDate)} to ${formatDateTime(item.expiryDate)}` }))} />
      </Card>;
    case 'warranty_summary':
      return <Card title={`Warranties by ${words(response.groupBy)}`}><Counts total={response.total} groups={response.groups} /></Card>;
    case 'warranty_exceptions':
      return <Card title={`Warranty attention (${of(response.items.length, response.pageInfo.total)})`}>
        <Rows empty="No warranty conditions need attention." rows={response.items.map(item => ({ key: `${item.recordId}-${item.rule}`, title: words(item.rule), status: item.severity, subtitle: `Record ${item.recordId}` }))} />
      </Card>;
    case 'operational_changes':
      return <Card title={`Activity (${of(response.items.length, response.pageInfo.total)})`}>
        <p className={styles.muted}>{formatDateTime(response.window.from)} to {formatDateTime(response.window.to)}</p>
        <Rows empty="No activity recorded in this window." rows={response.items.map(item => ({ key: item.id, title: words(item.event), subtitle: `${words(item.module)} · ${formatDateTime(item.occurredAt)}` }))} />
      </Card>;
    case 'executive_overview': {
      const { inventory, dealers, enquiries, warranties, attention, activity } = response;
      const attentionTotal = attention.inventory.total + attention.dealers.total + attention.enquiries.total + attention.warranties.total;
      return <Card title="Overview">
        <Fields fields={[
          ['Inventory', `${inventory.availableSerials} available of ${inventory.totalSerials} serials`],
          ['Dealers', `${dealers.activeDealers} active of ${dealers.totalDealers} · ${dealers.unassignedDealers} unassigned · ${dealers.totalDistributors} distributors`],
          ['Enquiries', `${enquiries.new} new · ${enquiries.inProgress} in progress · ${enquiries.closed} closed · ${enquiries.unassigned} unassigned`],
          ['Warranties', `${warranties.active} active · ${warranties.expired} expired · ${warranties.void} void · ${warranties.registeredToday} registered today`],
          ['Needs attention', `${attentionTotal} (inventory ${attention.inventory.total}, dealers ${attention.dealers.total}, enquiries ${attention.enquiries.total}, warranties ${attention.warranties.total})`],
          ['Activity', `${activity.total} events, ${formatDateTime(activity.window.from)} to ${formatDateTime(activity.window.to)}`],
        ]} />
        <Rows empty="No activity in this window." rows={activity.items.map(item => ({ key: item.id, title: words(item.event), subtitle: `${words(item.module)} · ${formatDateTime(item.occurredAt)}` }))} />
      </Card>;
    }
    default: {
      const unhandled: never = response;
      return unhandled;
    }
  }
}

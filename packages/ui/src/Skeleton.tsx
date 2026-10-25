import React from 'react';
import { SlowLoadingNotice } from './NetworkStatus';

export type SkeletonLayout = 'table' | 'scorecard' | 'dashboard' | 'cards' | 'catalog' | 'availability' | 'detail' | 'product' | 'form' | 'account' | 'guide' | 'appearance' | 'conversation' | 'warranty';

/** Decorative placeholders never expose fake values or focusable controls. */
export function Skeleton({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return <div aria-hidden="true" className="tx-skeleton" style={{ width, height }} />;
}

function Lines({ count = 3 }: { count?: number }) {
  return <div className="tx-sk-stack">{Array.from({ length: count }, (_, i) => <Skeleton key={i} width={i % 2 ? '58%' : '84%'} />)}</div>;
}

function Table({ columns = 5, rows = 7 }: { columns?: number; rows?: number }) {
  return <div className="tx-sk-table">{Array.from({ length: rows + 1 }, (_, row) => (
    <div key={row} className="tx-sk-row" style={{ gridTemplateColumns: `minmax(140px, 2fr) repeat(${columns - 1}, minmax(80px, 1fr))` }}>
      {Array.from({ length: columns }, (_, col) => <Skeleton key={col} width={row === 0 ? '65%' : `${55 + ((row + col) % 3) * 15}%`} height={row === 0 ? 12 : 14} />)}
    </div>
  ))}</div>;
}

function Panel({ fields = false }: { fields?: boolean }) {
  return <div className="tx-sk-panel"><Skeleton width="38%" height={18} /><div className="tx-sk-fields">{Array.from({ length: 6 }, (_, i) => <div className="tx-sk-stack" key={i}><Skeleton width="45%" height={11} /><Skeleton width={fields ? '100%' : '75%'} height={fields ? 38 : 16} /></div>)}</div></div>;
}

function Records({ count = 4 }: { count?: number }) {
  return <div>{Array.from({ length: count }, (_, i) => <div key={i} className="tx-sk-catalog-row"><Lines count={2} /><Skeleton width={70} height={20} /></div>)}</div>;
}

export interface PageSkeletonProps {
  label: string;
  layout?: SkeletonLayout;
  columns?: number;
  summary?: boolean;
}

/** Content-only variant is also used while an organization refresh is pending. */
export function PageSkeleton({ label, layout = 'table', columns = 5, summary = false }: PageSkeletonProps) {
  return <div className={`tx-sk-content tx-sk-${layout}`}>
    <SlowLoadingNotice />
    <div role="status" aria-label={`Loading ${label}`} aria-busy="true">
    <span className="tx-sk-sr">Loading {label}…</span>
    <div aria-hidden="true" className="tx-sk-stack tx-sk-page">
      {layout !== 'scorecard' && <div className={layout === 'dashboard' ? 'tx-sk-hero' : 'tx-sk-heading'}><Skeleton width={summary ? '88%' : '38%'} height={summary ? 36 : 28} /><Skeleton width={summary ? '60%' : '55%'} height={summary ? 36 : 14} /></div>}
      {layout === 'warranty' && <div className="tx-sk-stack"><Skeleton width={180} height={18} /><Skeleton width="min(100%, 576px)" height={38} /></div>}
      {['table', 'catalog', 'cards', 'warranty', 'availability'].includes(layout) && <div className="tx-sk-toolbar"><Skeleton width="min(100%, 320px)" height={36} /><Skeleton width={110} height={36} /><Skeleton width={90} height={36} /></div>}
      {(layout === 'table' || layout === 'scorecard' || layout === 'warranty') && <Table columns={columns} rows={layout === 'scorecard' ? 5 : 7} />}
      {layout === 'dashboard' && <><div className="tx-sk-dashboard-grid"><div className="tx-sk-stack"><Skeleton width="45%" /><Records /></div><div className="tx-sk-panel"><Lines count={7} /></div></div><Skeleton width="30%" height={18} /><Records /></>}
      {layout === 'catalog' && <>{Array.from({ length: 5 }, (_, i) => <div key={i} className="tx-sk-catalog-row"><Lines count={4} /></div>)}</>}
      {layout === 'availability' && <>{Array.from({ length: 3 }, (_, i) => <div className="tx-sk-stack" key={i}><Skeleton width={160} height={12} />{Array.from({ length: 2 }, (_, j) => <div className="tx-sk-catalog-row" key={j}><Lines count={2} /><Skeleton width={110} height={18} /></div>)}</div>)}</>}
      {layout === 'cards' && <div className="tx-sk-two-col">{Array.from({ length: 6 }, (_, i) => <Panel key={i} />)}</div>}
      {['detail', 'product', 'account'].includes(layout) && <><div className="tx-sk-toolbar"><Skeleton width={100} height={32} /><Skeleton width={100} height={32} /><Skeleton width={100} height={32} /></div><div className="tx-sk-two-col">{layout === 'product' ? <div className="tx-sk-panel"><Skeleton height={250} /></div> : <Panel />}<Panel /></div><Panel /></>}
      {layout === 'form' && <div className="tx-sk-form"><Panel fields /><Panel fields /><Skeleton width={140} height={40} /></div>}
      {layout === 'guide' && <><div className="tx-sk-toolbar"><Skeleton width={120} height={36} /><Skeleton width={120} height={36} /></div><div className="tx-sk-panel"><Skeleton width="50%" height={24} /><Lines count={8} /></div></>}
      {layout === 'appearance' && <div className="tx-sk-form"><div className="tx-sk-two-col"><Skeleton height={180} /><Skeleton height={180} /></div><Panel fields /></div>}
      {layout === 'conversation' && <div className="tx-sk-chat"><div className="tx-sk-panel"><Lines count={4} /></div><div className="tx-sk-composer"><Skeleton height={100} /></div></div>}
    </div>
    </div>
  </div>;
}

/** Pages currently own their shells, so route fallbacks must reserve that space too. */
export function WorkspaceSkeleton({ distributor = false, secondary = false, ...props }: PageSkeletonProps & { distributor?: boolean; secondary?: boolean }) {
  return <div className={`tx-sk-shell ${distributor ? 'tx-sk-distributor' : 'tx-sk-portal'}`}>
    <div aria-hidden="true" className="tx-sk-mobile"><Skeleton width={140} height={25} /><Skeleton width={32} height={32} /></div>
    <div aria-hidden="true" className="tx-sk-rail">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} width={32} height={32} />)}</div>
    {secondary && <div aria-hidden="true" className="tx-sk-sidebar"><Skeleton width="80%" height={20} /><Lines count={10} /></div>}
    <main className="tx-sk-main"><PageSkeleton {...props} /></main>
  </div>;
}

import React from 'react';

// Exact geometry from the portal's operational icon family: 24px, 1.5px stroke.
type IconProps = React.SVGProps<SVGSVGElement>;

export function EmptyStockTrayIcon({ className = 'tx-status-icon', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Modular warehouse stock bin container */}
      <path d="M3.5 7.5L5.5 4h13l2 3.5" />
      <path d="M3.5 7.5v11a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-11H3.5z" />
      {/* Front drop picking opening */}
      <path d="M7.5 7.5v4.5a0.5.5 0 0 0 .5.5h8a0.5.5 0 0 0 .5-.5V7.5" />
      {/* Depleted/zero stock indicator line */}
      <line x1="9" y1="16" x2="15" y2="16" />
      <circle cx="12" cy="16" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function DisconnectedWorkshopIcon({ className = 'tx-status-icon', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Workshop structure */}
      <path d="M3 9.5L8 5.5l5 4" />
      <path d="M3 9.5v10h10v-10" />
      <path d="M6.5 19.5v-5h3v5" />
      {/* Broken/disconnected link branch */}
      <line x1="13" y1="14" x2="16" y2="14" />
      {/* Disconnection break cross */}
      <line x1="18.5" y1="11.5" x2="22" y2="15" />
      <line x1="22" y1="11.5" x2="18.5" y2="15" />
      {/* Detached hub node */}
      <rect x="18" y="17.5" width="4" height="4" rx="0.5" />
    </svg>
  );
}

export function OperationsBoardIcon({ className = 'tx-status-icon', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Scorecard dashboard console board */}
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      {/* Header telemetry divider */}
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="6" y1="5.5" x2="10" y2="5.5" />
      {/* KPI balance readout bars */}
      <line x1="6" y1="12" x2="13" y2="12" />
      <line x1="6" y1="16" x2="11" y2="16" />
      {/* Reconciled status tile */}
      <rect x="15" y="11" width="3.5" height="5.5" rx="0.5" />
      <line x1="16.75" y1="13" x2="16.75" y2="14.5" />
    </svg>
  );
}


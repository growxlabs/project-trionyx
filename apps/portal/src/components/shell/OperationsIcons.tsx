import React from 'react';

/**
 * TRIONYX OPERATIONS ICON FAMILY
 *
 * Custom industrial / enterprise operational icon system:
 * - 20x20 artboard with squared proportions
 * - 1.5px consistent stroke width
 * - Monochrome currentColor styling
 * - Technical, quiet, non-decorative
 *
 * Real operational mappings:
 * - Overview = Control Panel
 * - Studios = Workshop / Studio Registry
 * - Inventory = Stock Stack / Serial Inventory
 * - Products = Surface Formula / Shield Layer
 * - Distributor Hub = Connected Network Hub
 * - Compliance = Verification Shield
 * - Logs = Records / Ledger
 */

export interface IconProps {
  className?: string;
}

/** Overview: Modular control panel with telemetry grid */
export function ControlPanelIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="15" height="15" rx="0.75" />
      <line x1="2.5" y1="8" x2="17.5" y2="8" />
      <line x1="5.5" y1="5.25" x2="8.5" y2="5.25" />
      <line x1="11.5" y1="5.25" x2="14.5" y2="5.25" />
      <line x1="9.5" y1="8" x2="9.5" y2="17.5" />
      <line x1="5" y1="11.5" x2="7" y2="11.5" />
      <line x1="5" y1="14" x2="7" y2="14" />
      <rect x="12" y="11" width="3" height="3" rx="0.5" />
    </svg>
  );
}

/** Studios: Detailing studio workshop bay with overhead gantry rail & alignment lift */
export function StudioRegistryIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 17.5V4.5H17.5V17.5" />
      <line x1="1" y1="4.5" x2="19" y2="4.5" />
      <line x1="5.5" y1="13.5" x2="14.5" y2="13.5" />
      <line x1="7.5" y1="13.5" x2="7.5" y2="17.5" />
      <line x1="12.5" y1="13.5" x2="12.5" y2="17.5" />
      <line x1="6" y1="8" x2="14" y2="8" />
      <circle cx="10" cy="8" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Inventory: Industrial stock pallet stack with discrete serial registration ticks */
export function StockInventoryIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="3" width="15" height="5.5" rx="0.5" />
      <line x1="6.5" y1="3" x2="6.5" y2="8.5" />
      <line x1="10" y1="5.75" x2="14" y2="5.75" />
      <rect x="2.5" y="11.5" width="15" height="5.5" rx="0.5" />
      <line x1="6.5" y1="11.5" x2="6.5" y2="17" />
      <line x1="9.5" y1="14.25" x2="11.5" y2="14.25" />
      <line x1="13" y1="14.25" x2="15.5" y2="14.25" />
    </svg>
  );
}

/** Products: 3-tier engineered surface formula strata (Graphene / Ceramic / Clearcoat substrate) */
export function SurfaceFormulaIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 5.5L10 2.5L17.5 5.5L10 8.5L2.5 5.5Z" />
      <path d="M2.5 9.5L10 12.5L17.5 9.5" />
      <path d="M2.5 13.5L10 16.5L17.5 13.5" />
      <line x1="10" y1="8.5" x2="10" y2="12.5" />
      <line x1="10" y1="12.5" x2="10" y2="16.5" />
    </svg>
  );
}

/** Distributor Hub: Central dispatch hub node routing to regional distribution points */
export function NetworkHubIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="7.5" y="7.5" width="5" height="5" rx="0.5" />
      <rect x="2.5" y="2.5" width="3.5" height="3.5" rx="0.5" />
      <rect x="14" y="2.5" width="3.5" height="3.5" rx="0.5" />
      <rect x="8.25" y="14.5" width="3.5" height="3.5" rx="0.5" />
      <path d="M5.5 5.5L8 8" />
      <path d="M14.5 5.5L12 8" />
      <line x1="10" y1="12.5" x2="10" y2="14.5" />
    </svg>
  );
}

/** Compliance: Verification shield with cryptographic guarantee checkmark */
export function VerificationShieldIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 2.5L3.5 5.5V10.5C3.5 14.5 6.5 17 10 18C13.5 17 16.5 14.5 16.5 10.5V5.5L10 2.5Z" />
      <path d="M7 10.25L9 12.25L13 7.75" />
    </svg>
  );
}

/** Logs: Sequential activity ledger / intake docket with line items */
export function RecordsLedgerIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="2.5" width="13" height="15" rx="0.75" />
      <line x1="3.5" y1="6" x2="16.5" y2="6" />
      <line x1="6.5" y1="9.5" x2="13.5" y2="9.5" />
      <line x1="6.5" y1="12.5" x2="11.5" y2="12.5" />
      <circle cx="6.5" cy="4.25" r="0.75" fill="currentColor" />
      <line x1="9" y1="4.25" x2="13.5" y2="4.25" />
    </svg>
  );
}

/** Theme / Calibration: Technical precision slider control */
export function CalibrationTuningIcon({ className = 'w-5 h-5 shrink-0' }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="17" y2="6" />
      <line x1="3" y1="14" x2="17" y2="14" />
      <rect x="6" y="3.5" width="4" height="5" rx="0.5" />
      <rect x="11" y="11.5" width="4" height="5" rx="0.5" />
    </svg>
  );
}

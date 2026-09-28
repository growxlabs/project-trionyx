import React from 'react';

/**
 * TRIONYX OPERATIONS ICON FAMILY
 *
 * Custom industrial / enterprise operational icon system for Trionyx:
 * - Canvas: 24 × 24
 * - Visible graphic: 18–20px
 * - Stroke: 1.5px consistent stroke width
 * - Squared, technical geometry without bulky fills, background shapes, glow, or gradients
 * - Communicates real automotive distribution operations
 *
 * Modules & Real Operational Mappings:
 *
 * [Main Sidebar & Shell]
 * 1. Overview       -> Operations control board (modular telemetry console & instrumentation grid)
 * 2. Studios        -> Automotive workshop frontage (detailing bay facade, gantry lintel & lift)
 * 3. Inventory      -> Serial stock trays (tiered stock racking trays with serial partitions)
 * 4. Products       -> Layered coating/surface sheets (nanotech surface protection strata)
 * 5. Distributor Hub-> Connected distribution nodes (central fulfillment hub & regional spokes)
 * 6. Warranty       -> Verified shield with serial mark (automotive warranty shield + serial ticks)
 * 7. Records / Logs -> Operational ledger (hardbound sequential journal with chronological lines)
 * 8. Settings       -> Industrial control sliders (dual precision calibration rails & thumbs)
 *
 * [Overview — Exception Queues]
 * 9. Products Out of Stock -> Empty stock tray (depleted modular stock container)
 * 10. Studios Missing Hub   -> Disconnected workshop/node (workshop bay with severed network branch)
 * 11. Partner Applications  -> Application document with approval mark (intake form + seal)
 *
 * [Overview — Records]
 * 12. Operations Summary    -> Operations board (metrics console & KPI readout)
 * 13. Recent Operations     -> Chronological ledger (timestamped journal docket with timeline thread)
 * 14. Inventory by Location -> Location marker combined with stock layers (pinpoint + stock strata)
 */

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/* ========================================================================== */
/* 1. MAIN SIDEBAR & NAVIGATION ICONS (Canvas: 24x24, 1.5px stroke)           */
/* ========================================================================== */

/** Overview: Automotive operations control board with modular telemetry grid & meters */
export function ControlBoardIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Outer control panel chassis */}
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      {/* Top telemetry status bar divider */}
      <line x1="3" y1="8.5" x2="21" y2="8.5" />
      {/* System meters & status registers */}
      <line x1="6" y1="5.75" x2="9.5" y2="5.75" />
      <line x1="12" y1="5.75" x2="14.5" y2="5.75" />
      <line x1="17" y1="5.75" x2="18" y2="5.75" />
      {/* Vertical control bus split */}
      <line x1="12" y1="8.5" x2="12" y2="21" />
      {/* Left telemetry channel sliders */}
      <line x1="6" y1="12.25" x2="9" y2="12.25" />
      <line x1="6" y1="16" x2="9" y2="16" />
      {/* Right channel control switchboard modules */}
      <rect x="14.5" y="11" width="3.5" height="3.5" rx="0.5" />
      <rect x="14.5" y="16" width="3.5" height="3.5" rx="0.5" />
    </svg>
  );
}

/** Studios: Automotive detailing workshop frontage with roll-up bay facade & lift gantry */
export function WorkshopFrontageIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Workshop facade roofline lintel */}
      <path d="M2.5 7.5h19" />
      <path d="M4 7.5V4.5a0.5.5 0 0 1 .5-.5h15a0.5.5 0 0 1 .5.5V7.5" />
      {/* Workshop structural perimeter */}
      <path d="M4 7.5v13h16v-13" />
      {/* Automotive roll-up applicator bay door */}
      <path d="M7.5 20.5v-10h9v10" />
      {/* Overhead shutter slat line */}
      <line x1="7.5" y1="13.5" x2="16.5" y2="13.5" />
      {/* Alignment lift gantry platform crossbar */}
      <line x1="9.5" y1="17" x2="14.5" y2="17" />
      <circle cx="12" cy="10.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Inventory: Tiered industrial serial stock racking trays with partition marks */
export function SerialStockTraysIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Tier 1 Stock Tray */}
      <rect x="3" y="3.5" width="18" height="5" rx="0.75" />
      <line x1="8" y1="3.5" x2="8" y2="8.5" />
      <line x1="11.5" y1="6" x2="16.5" y2="6" />

      {/* Tier 2 Stock Tray */}
      <rect x="3" y="10" width="18" height="5" rx="0.75" />
      <line x1="14" y1="10" x2="14" y2="15" />
      <line x1="6.5" y1="12.5" x2="11.5" y2="12.5" />

      {/* Tier 3 Stock Tray */}
      <rect x="3" y="16.5" width="18" height="5" rx="0.75" />
      <line x1="9" y1="16.5" x2="9" y2="21.5" />
      <line x1="12.5" y1="19" x2="17.5" y2="19" />
    </svg>
  );
}

/** Products: Tiered layered coating/surface strata sheets (Ceramic, Graphene, Substrate) */
export function LayeredCoatingSheetsIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Top nano-coating strata sheet */}
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      {/* Intermediate ceramic core sheet */}
      <path d="M3 12l9 4.5 9-4.5" />
      {/* Substrate bonding sheet */}
      <path d="M3 16.5l9 4.5 9-4.5" />
      {/* Layer vertical alignment guides */}
      <line x1="12" y1="12" x2="12" y2="16.5" />
      <line x1="12" y1="16.5" x2="12" y2="21" />
    </svg>
  );
}

/** Distributor Hub: Central distribution hub node connected to regional spokes */
export function ConnectedNodesIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Central dispatch hub node */}
      <rect x="9" y="9" width="6" height="6" rx="0.75" />

      {/* Regional distribution nodes */}
      <rect x="3" y="3" width="4.5" height="4.5" rx="0.5" />
      <rect x="16.5" y="3" width="4.5" height="4.5" rx="0.5" />
      <rect x="9.75" y="17.5" width="4.5" height="4.5" rx="0.5" />

      {/* Distribution transfer routing branches */}
      <path d="M6.5 7.5L9.5 10.5" />
      <path d="M17.5 7.5L14.5 10.5" />
      <line x1="12" y1="15" x2="12" y2="17.5" />
    </svg>
  );
}

/** Warranty: Automotive verification protection shield with engraved serial registration mark */
export function VerifiedShieldIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Technical automotive protection shield */}
      <path d="M12 2.5L4 6v6.5c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3.5z" />
      {/* Verification audit checkmark */}
      <path d="M8.5 11.5l2.5 2.5 4.5-4.5" />
      {/* Serial mark register ticks */}
      <line x1="8" y1="16.5" x2="16" y2="16.5" />
      <line x1="10.5" y1="15.5" x2="10.5" y2="17.5" />
      <line x1="13.5" y1="15.5" x2="13.5" y2="17.5" />
    </svg>
  );
}

/** Records / Logs: Heavy-duty operational activity ledger with chronological journal lines */
export function OperationalLedgerIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Ledger book chassis */}
      <rect x="4" y="3" width="16" height="18" rx="1" />
      {/* Spine binding seam */}
      <line x1="8.5" y1="3" x2="8.5" y2="21" />
      {/* Binding ledger rivets */}
      <circle cx="6.25" cy="6.5" r="0.75" fill="currentColor" />
      <circle cx="6.25" cy="12" r="0.75" fill="currentColor" />
      <circle cx="6.25" cy="17.5" r="0.75" fill="currentColor" />
      {/* Chronological intake line entries */}
      <line x1="11.5" y1="7.5" x2="17" y2="7.5" />
      <line x1="11.5" y1="11.5" x2="17" y2="11.5" />
      <line x1="11.5" y1="15.5" x2="15" y2="15.5" />
    </svg>
  );
}

/** Settings: Dual industrial calibration sliders with mechanical thumb blocks */
export function ControlSlidersIcon({ className = 'w-5 h-5 shrink-0', ...props }: IconProps) {
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
      {/* Parallel calibration tracks */}
      <line x1="3.5" y1="7.5" x2="20.5" y2="7.5" />
      <line x1="3.5" y1="16.5" x2="20.5" y2="16.5" />
      {/* Mechanical thumb slider A */}
      <rect x="7" y="4.5" width="4.5" height="6" rx="0.75" />
      <line x1="9.25" y1="6.25" x2="9.25" y2="8.75" />
      {/* Mechanical thumb slider B */}
      <rect x="13.5" y="13.5" width="4.5" height="6" rx="0.75" />
      <line x1="15.75" y1="15.25" x2="15.75" y2="17.75" />
    </svg>
  );
}

/* ========================================================================== */
/* 2. OVERVIEW — EXCEPTION QUEUE ICONS (16px display, 24x24 canvas)          */
/* ========================================================================== */

/** Products Out of Stock: Empty warehouse stock tray / depleted modular container */
export function EmptyStockTrayIcon({ className = 'w-4 h-4 shrink-0', ...props }: IconProps) {
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

/** Studios Missing Hub: Workshop building with a severed/disconnected distribution link */
export function DisconnectedWorkshopIcon({ className = 'w-4 h-4 shrink-0', ...props }: IconProps) {
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

/** Partner Applications: Inbound application document with approval seal / verification check */
export function ApplicationDocumentIcon({ className = 'w-4 h-4 shrink-0', ...props }: IconProps) {
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
      {/* Application sheet with folded corner */}
      <path d="M5 3h9l5 5v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      {/* Document application data lines */}
      <line x1="8" y1="10" x2="11.5" y2="10" />
      <line x1="8" y1="13.5" x2="14" y2="13.5" />
      {/* Approval seal mark */}
      <circle cx="14" cy="17" r="2.75" />
      <path d="M12.8 17l0.8 0.8 1.6-1.6" />
    </svg>
  );
}

/* ========================================================================== */
/* 3. OVERVIEW — RECORDS ICONS (16px display, 24x24 canvas)                   */
/* ========================================================================== */

/** Operations Summary: Operations board with KPI metric bars and status registers */
export function OperationsBoardIcon({ className = 'w-4 h-4 shrink-0', ...props }: IconProps) {
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

/** Recent Operations: Chronological ledger docket with sequential timeline events */
export function ChronologicalLedgerIcon({ className = 'w-4 h-4 shrink-0', ...props }: IconProps) {
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
      {/* Chronological ledger chassis */}
      <rect x="4" y="3" width="16" height="18" rx="1" />
      {/* Top docket chronometer bar */}
      <line x1="4" y1="7.5" x2="20" y2="7.5" />
      {/* Chronological timeline spine */}
      <line x1="8" y1="7.5" x2="8" y2="21" />
      {/* Timeline event nodes */}
      <circle cx="8" cy="11.5" r="1" fill="currentColor" />
      <line x1="11" y1="11.5" x2="16.5" y2="11.5" />
      <circle cx="8" cy="16.5" r="1" fill="currentColor" />
      <line x1="11" y1="16.5" x2="15" y2="16.5" />
    </svg>
  );
}

/** Inventory by Location: Geographic location pin combined with tiered stock racking layers */
export function LocationStockLayersIcon({ className = 'w-4 h-4 shrink-0', ...props }: IconProps) {
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
      {/* Facility pinpoint location marker */}
      <path d="M12 2.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 7 4.5 7s4.5-3.8 4.5-7A4.5 4.5 0 0 0 12 2.5z" />
      <circle cx="12" cy="7" r="1.5" />
      {/* Tiered horizontal warehouse inventory strata shelves */}
      <line x1="3.5" y1="17.5" x2="20.5" y2="17.5" />
      <line x1="3.5" y1="21.5" x2="20.5" y2="21.5" />
      {/* Storage rack vertical stanchions */}
      <line x1="6" y1="17.5" x2="6" y2="21.5" />
      <line x1="18" y1="17.5" x2="18" y2="21.5" />
    </svg>
  );
}

/* ========================================================================== */
/* 4. BACKWARDS-COMPATIBILITY ALIASES                                         */
/* ========================================================================== */

export const ControlPanelIcon = ControlBoardIcon;
export const StudioRegistryIcon = WorkshopFrontageIcon;
export const StockInventoryIcon = SerialStockTraysIcon;
export const SurfaceFormulaIcon = LayeredCoatingSheetsIcon;
export const NetworkHubIcon = ConnectedNodesIcon;
export const VerificationShieldIcon = VerifiedShieldIcon;
export const RecordsLedgerIcon = OperationalLedgerIcon;
export const CalibrationTuningIcon = ControlSlidersIcon;

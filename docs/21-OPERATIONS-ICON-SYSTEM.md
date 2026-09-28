# 21 — Trionyx Operations Icon System

> **STATUS: LOCKED & IMPLEMENTED**  
> **Source Component:** [`apps/portal/src/components/shell/OperationsIcons.tsx`](file:///c:/growxlabs/trionyx/trion-yx/apps/portal/src/components/shell/OperationsIcons.tsx)  
> **Scope:** Internal Operations Portal — Navigation Rail, Exception Queues, and Records.  

---

## 1. Design Principles & Technical Specifications

The Trionyx Operations Icon System is a custom-engineered iconography family designed specifically for automotive distribution operations. It replaces generic SaaS icon sets (Lucide, Heroicons, Feather) with domain-accurate operational symbols.

### 1.1 Geometry & Artboard Rules
* **Artboard Canvas:** Exactly `24 × 24` (`viewBox="0 0 24 24"`).
* **Optical Size:** Visible geometry occupies `18px–20px` (2px–3px padding perimeter).
* **Stroke Width:** Strict `1.5px` uniform stroke width across all glyphs.
* **Line Caps & Joins:** `strokeLinecap="round"`, `strokeLinejoin="round"`.
* **Proportions:** Slightly squared, technical/industrial geometry (subtle rounded corners with `rx="0.5"` to `1.5` on rectangular nodes).
* **Fill Rules:** Pure outline graphics (`fill="none"`); solid fills are restricted to small optical register dots (`r="0.75"` to `1.0`).
* **Forbidden Attributes:**
  * No background circles, badges, or rounded tiles behind icons.
  * No gradients or multiple opacity layers.
  * No drop shadows or glowing halos.
  * No animated pulse dots or decorative styling.

---

## 2. Icon Directory & Operational Mappings

### 2.1 Main Navigation Rail & Shell Icons

| Module | Component Name | Operational Concept | Physical Metaphor & Geometry |
| :--- | :--- | :--- | :--- |
| **Overview** | `ControlBoardIcon` | Operations control board | Modular instrumentation console with top telemetry split, system meters, status registers, and dual switchboard modules. |
| **Studios** | `WorkshopFrontageIcon` | Automotive workshop frontage | Detailing studio workshop facade with industrial lintel header, roll-up applicator bay door, horizontal slats, and vehicle alignment lift platform. |
| **Inventory** | `SerialStockTraysIcon` | Serial stock trays | Three tiered industrial warehouse racking trays with discrete serial register slots and barcode partitions. |
| **Products** | `LayeredCoatingSheetsIcon` | Layered coating/surface sheets | 3-tier precision isometric protective surface sheets (top nano-matrix, ceramic core, substrate bonding layer) with alignment guides. |
| **Distributor Hub** | `ConnectedNodesIcon` | Connected distribution nodes | Central dispatch fulfillment hub node linked orthogonally and diagonally to regional distribution spoke nodes. |
| **Warranty** | `VerifiedShieldIcon` | Verified shield with serial mark | Technical automotive warranty protection shield containing an inspection verification checkmark and engraved serial registration ticks. |
| **Records / Logs** | `OperationalLedgerIcon` | Operational ledger | Bound sequential intake docket with left margin binding seam, mechanical binding rivets, and chronological activity journal lines. |
| **Settings** | `ControlSlidersIcon` | Industrial control sliders | Parallel calibration tracks with dual mechanical thumb slider blocks and grip registration marks. |

---

### 2.2 Overview — Exception Queue Icons (16px Display)

Rendered at `w-4 h-4 shrink-0` directly preceding queue labels inside clickable row buttons:

| Exception Queue | Component Name | Operational Concept | Visual Geometry & Behavior |
| :--- | :--- | :--- | :--- |
| **Products Out of Stock** | `EmptyStockTrayIcon` | Empty stock tray | Depleted modular stock container with top picking aperture, hollow cavity, and zero-inventory indicator line. Uses semantic danger color (`text-[var(--status-danger)]`). |
| **Studios Missing Hub** | `DisconnectedWorkshopIcon` | Disconnected workshop/node | Workshop structure with a severed network branch, disconnect cross, and detached regional hub node. Uses semantic warning color (`text-[var(--status-warning)]`). |
| **Partner Applications** | `ApplicationDocumentIcon` | Application document with approval mark | Partner dealership intake application sheet with folded upper corner, spec lines, and circular pending verification seal. Uses Trionyx orange / accent (`text-[#F26522]`). |

---

### 2.3 Overview — Records Icons (16px Display)

Rendered at `w-4 h-4 shrink-0` directly preceding record view labels inside clickable row buttons:

| Record View | Component Name | Operational Concept | Visual Geometry & Behavior |
| :--- | :--- | :--- | :--- |
| **Operations Summary** | `OperationsBoardIcon` | Operations board | Compact operations scorecard board with title status header, KPI balance bars, and reconciled status register tile. |
| **Recent Operations** | `ChronologicalLedgerIcon` | Chronological ledger | Activity ledger chassis with top chronometer clamp, vertical timeline spine, and timestamped transaction event nodes. |
| **Inventory by Location** | `LocationStockLayersIcon` | Location marker with stock layers | Automotive facility pinpoint location marker integrated with tiered horizontal warehouse stock strata shelving. |

---

## 3. Color Tokens & Interactive States

### 3.1 Dark Sidebar Rail (`bg-[#171714]`)
* **Default / Inactive:** Muted warm grey (`#B7B2A8` / `text-[#B7B2A8]`).
* **Hover:** Warm white (`#F5F3EC` / `hover:text-[#F5F3EC]`) on `#22221E]/60` surface.
* **Active:** Trionyx orange (`#F26522` / `text-[#F26522]`) on `#22221E` surface with a restrained `2px` orange vertical left rail indicator.
* **Tooltips:** Hover popout in `#22221E` with `#F5F3EC` text showing the plain English module name without decorative descriptions.
* **Keyboard Focus:** High-contrast orange focus ring (`focus-visible:outline-2 focus-visible:outline-[#F26522] focus-visible:outline-offset-2`).

### 3.2 Light Overview Content (`bg-[var(--surface-raised)]`)
* **Default:** Muted charcoal (`var(--text-secondary)` / `text-[var(--text-secondary)]`).
* **Selected Row:** Trionyx orange (`#F26522` / `text-[#F26522]`).
* **Critical Exceptions:**
  * Out of stock: Semantic danger (`var(--status-danger)`).
  * Unassigned studios: Semantic warning (`var(--status-warning)`).
  * Partner applications: Trionyx orange (`#F26522` / `var(--accent)`).

---

## 4. Developer Usage Guide

### 4.1 Importing Icons
```tsx
import {
  // Main Rail
  ControlBoardIcon,
  WorkshopFrontageIcon,
  SerialStockTraysIcon,
  LayeredCoatingSheetsIcon,
  ConnectedNodesIcon,
  VerifiedShieldIcon,
  OperationalLedgerIcon,
  ControlSlidersIcon,

  // Overview Queues
  EmptyStockTrayIcon,
  DisconnectedWorkshopIcon,
  ApplicationDocumentIcon,

  // Overview Records
  OperationsBoardIcon,
  ChronologicalLedgerIcon,
  LocationStockLayersIcon,
} from '@/components/shell/OperationsIcons';
```

### 4.2 Standard Props
All icons implement the shared `IconProps` interface:
```typescript
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}
```

### 4.3 Sizing Patterns
* **Rail Navigation:** `<ControlBoardIcon className="w-5 h-5 shrink-0" />`
* **Queue / Record Row:** `<EmptyStockTrayIcon className="w-4 h-4 shrink-0" />`

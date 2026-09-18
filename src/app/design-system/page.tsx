'use client';

import React, { useState } from 'react';
import { rawColors } from '@/tokens';

/* Import Production UI Primitives */
import {
  Display,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  LargeBody,
  Body,
  SmallBody,
  Label,
  Caption,
  Overline,
  NumericData,
} from '@/components/ui/Typography';

import { Button } from '@/components/ui/Button';
import { TrionyxLogo } from '@/components/ui/TrionyxLogo';
import { Chip, Pill } from '@/components/ui/Badge';
import {
  TextInput,
  SearchInput,
  Textarea,
  Select,
  Checkbox,
  Radio,
  ToggleSwitch,
  FileInput,
  FormLabel,
  HelperText,
  ErrorMessage,
} from '@/components/ui/Forms';

import {
  ShieldIcon,
  ShieldCheckIcon,
  DropletIcon,
  LayersIcon,
  SparklesIcon,
  SunIcon,
  ThermometerIcon,
  WrenchIcon,
  SearchIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  MinusIcon,
  FilterIcon,
  SlidersIcon,
  InfoIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  DownloadIcon,
  UploadIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  SpinnerIcon,
} from '@/components/ui/Icons';

/* Purpose-Built Cards */
import {
  ProductCard,
  ProductCategoryCard,
  MediaCard,
  InfoCard,
  FeatureCard,
  ArticleCard,
  ContactCard,
} from '@/components/cards';

/* Product UI Primitives */
import {
  ProductImageFrame,
  ProductSpecRow,
  ProductAttributeBadge,
  ProductGalleryThumbnail,
  ProductRelatedItem,
} from '@/components/product';

/* Navigation Primitives */
import {
  NavLink,
  DropdownItem,
  MegaMenuItem,
  Breadcrumb,
  MobileNavItem,
  BackAction,
  Pagination,
} from '@/components/navigation';

/* Feedback Components */
import {
  Alert,
  Tooltip,
  Modal,
  Drawer,
  Toast,
  Skeleton,
  EmptyState,
  LoadingIndicator,
} from '@/components/feedback';

export default function DesignSystemPage() {
  // Interactive state demos
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [toggleState, setToggleState] = useState(true);
  const [chipSelected, setChipSelected] = useState<string>('Ceramic Coating');
  const [radioVal, setRadioVal] = useState('option1');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const sections = [
    { id: 'foundations', title: '01 Foundations & Colors' },
    { id: 'typography', title: '02 Typography Scale' },
    { id: 'spacing', title: '03 Spacing & Layout' },
    { id: 'geometry', title: '04 Radius, Borders & Shadows' },
    { id: 'icons', title: '05 Custom Automotive Icons' },
    { id: 'buttons', title: '06 Buttons & Actions' },
    { id: 'chips-pills', title: '07 Chips & Status Pills' },
    { id: 'forms', title: '08 Form Controls' },
    { id: 'cards', title: '09 Purpose-Built Cards' },
    { id: 'product-ui', title: '10 Product UI Primitives' },
    { id: 'navigation', title: '11 Navigation Primitives' },
    { id: 'feedback', title: '12 Feedback & Dialogs' },
    { id: 'motion', title: '13 Motion & Transitions' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#151515] antialiased selection:bg-[#FF6A00] selection:text-white">
      {/* Internal System Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFEDEB]">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrionyxLogo size="sm" />
            <span className="text-[11px] font-mono uppercase text-[#626262] tracking-wider pl-2 border-l border-[#EFEDEB]">
              DESIGN SYSTEM — PHASE 01
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono bg-[#FAF8F6] border border-[#EFEDEB] px-2.5 py-1 rounded-[3px] text-[#2A2A2A]">
              Internal Review Mode
            </span>
            <Pill variant="brandOrange" size="sm" dot>
              Status: Ready for Approval
            </Pill>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex gap-10">
        {/* Left Sticky Section Navigator */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-1 text-[13px] border-r border-[#EFEDEB] pr-6">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#626262] block mb-3">
              System Architecture
            </span>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="block py-1.5 text-[#626262] hover:text-[#FF6A00] hover:translate-x-0.5 transition-all"
              >
                {sec.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 min-w-0 space-y-20 pb-32">
          {/* Section 01: Foundations & Colors */}
          <section id="foundations" className="space-y-6 pt-2">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">01 Foundations</Overline>
              <H2 className="mt-1">Color Palette & Semantic Tokens</H2>
              <Body color="muted" className="mt-1">
                Predominantly white with Deep Charcoal typography. Orange for primary actions and active states. Red for secondary accents and warnings.
              </Body>
            </div>

            {/* Core Swatches */}
            <div>
              <Label className="block mb-3">Client Brand Palette</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { name: 'Primary Orange', hex: rawColors.primaryOrange, desc: 'Primary CTAs & active highlights', text: 'text-white' },
                  { name: 'Primary Red', hex: rawColors.primaryRed, desc: 'Accents & critical states', text: 'text-white' },
                  { name: 'Deep Charcoal', hex: rawColors.deepCharcoal, desc: 'Primary typography & grounding', text: 'text-white' },
                  { name: 'Graphite', hex: rawColors.graphite, desc: 'Secondary headings & UI', text: 'text-white' },
                  { name: 'Body Gray', hex: rawColors.bodyGray, desc: 'Body text & muted labels', text: 'text-white' },
                  { name: 'Light Gray', hex: rawColors.lightGray, desc: 'Borders & chip surfaces', text: 'text-[#151515]' },
                  { name: 'Warm White', hex: rawColors.warmWhite, desc: 'Subtle card backgrounds', text: 'text-[#151515]' },
                  { name: 'Pure White', hex: rawColors.white, desc: 'Default site canvas', text: 'text-[#151515]', border: true },
                ].map((c) => (
                  <div key={c.hex} className="border border-[#EFEDEB] rounded-[4px] overflow-hidden bg-white">
                    <div
                      style={{ backgroundColor: c.hex }}
                      className={`h-16 p-2 flex flex-col justify-end ${c.text} ${c.border ? 'border-b border-[#EFEDEB]' : ''}`}
                    >
                      <span className="text-[11px] font-mono font-bold">{c.hex}</span>
                    </div>
                    <div className="p-2.5">
                      <h6 className="text-[12px] font-bold text-[#151515] leading-tight">{c.name}</h6>
                      <p className="text-[10px] text-[#626262] mt-1 line-clamp-2 leading-tight">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Rules & Behavior */}
            <div className="p-4 bg-[#FAF8F6] border border-[#EFEDEB] rounded-[4px] text-[13px] space-y-1.5">
              <h6 className="font-bold text-[#151515]">Strict Color Behaviour Guardrails:</h6>
              <ul className="list-disc pl-5 text-[#626262] space-y-1">
                <li>The interface remains predominantly white (canvas is 90%+ white/warm white).</li>
                <li>No large orange or red background flood fills.</li>
                <li>No arbitrary gradients (e.g. orange-to-red gradients are forbidden).</li>
                <li>Dark mode is NOT enabled by default to prevent distorting product photography.</li>
              </ul>
            </div>
          </section>

          {/* Section 02: Typography Scale */}
          <section id="typography" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">02 Typography</Overline>
              <H2 className="mt-1">Modern Sans-Serif Scale</H2>
              <Body color="muted" className="mt-1">
                Precision technical hierarchy suitable for automotive specifications, performance metrics, and clean readability.
              </Body>
            </div>

            <div className="space-y-6 bg-white border border-[#EFEDEB] rounded-[6px] p-6">
              <div className="border-b border-[#EFEDEB] pb-4">
                <span className="text-[11px] font-mono text-[#626262] block mb-1">Display (40px - 72px)</span>
                <Display>Automotive Precision Protection</Display>
              </div>

              <div className="border-b border-[#EFEDEB] pb-4">
                <span className="text-[11px] font-mono text-[#626262] block mb-1">H1 (32px - 48px)</span>
                <H1>Engineered Surface Defense</H1>
              </div>

              <div className="border-b border-[#EFEDEB] pb-4">
                <span className="text-[11px] font-mono text-[#626262] block mb-1">H2 (26px - 36px)</span>
                <H2>Next-Generation Ceramic Matrix</H2>
              </div>

              <div className="border-b border-[#EFEDEB] pb-4">
                <span className="text-[11px] font-mono text-[#626262] block mb-1">H3 (20px - 26px)</span>
                <H3>Hydrophobic & Thermal Shield Technology</H3>
              </div>

              <div className="border-b border-[#EFEDEB] pb-4">
                <span className="text-[11px] font-mono text-[#626262] block mb-1">H4 (20px)</span>
                <H4>Technical Laboratory Certifications & Testing</H4>
              </div>

              <div className="border-b border-[#EFEDEB] pb-4">
                <span className="text-[11px] font-mono text-[#626262] block mb-1">H5 (17px)</span>
                <H5>Application Guidelines & Vehicle Maintenance</H5>
              </div>

              <div className="border-b border-[#EFEDEB] pb-4">
                <span className="text-[11px] font-mono text-[#626262] block mb-1">H6 (15px)</span>
                <H6>Warranty Registration & Certified Installer Network</H6>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="text-[11px] font-mono text-[#626262] block mb-1">Large Body (18px)</span>
                  <LargeBody>
                    Trionyx delivers military-grade optical clarity with self-healing elastomeric topcoats designed to withstand gravel, road debris, and UV degradation.
                  </LargeBody>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#626262] block mb-1">Body Text (15px)</span>
                  <Body>
                    Every Trionyx coating formulation is lab-validated for extreme contact angle water repellency and scratch resistance across automotive clearcoats.
                  </Body>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#EFEDEB]">
                <div>
                  <span className="text-[10px] font-mono text-[#626262] block mb-1">Small Body (13px)</span>
                  <SmallBody>ISO 9001 certified laboratory formulation.</SmallBody>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#626262] block mb-1">Label (13px Semibold)</span>
                  <Label>CONTACT ANGLE: 118°</Label>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#626262] block mb-1">Overline (11px Uppercase)</span>
                  <Overline color="brandOrange">SPECIFICATION</Overline>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#626262] block mb-1">Numeric Data (Monospace)</span>
                  <NumericData>9.2H / 8.5 MIL</NumericData>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Spacing & Layout */}
          <section id="spacing" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">03 Layout</Overline>
              <H2 className="mt-1">Spacing Scale & Container Constraints</H2>
              <Body color="muted" className="mt-1">
                Predictable 4px-based geometric progression. Spacious layout containers to prevent edge-to-edge stretching on ultra-wide screens.
              </Body>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spacing Bars */}
              <div className="p-5 border border-[#EFEDEB] rounded-[6px] bg-white space-y-3">
                <Label className="block mb-2">Spacing Scale Tokens</Label>
                {[
                  { name: 'xxs (2px)', width: '2px' },
                  { name: 'xs (4px)', width: '4px' },
                  { name: 'sm (8px)', width: '8px' },
                  { name: 'md (12px)', width: '12px' },
                  { name: 'base (16px)', width: '16px' },
                  { name: 'lg (20px)', width: '20px' },
                  { name: 'xl (24px)', width: '24px' },
                  { name: '2xl (32px)', width: '32px' },
                  { name: '3xl (40px)', width: '40px' },
                  { name: '4xl (48px)', width: '48px' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3 text-[12px] font-mono">
                    <span className="w-24 text-[#626262] shrink-0">{s.name}</span>
                    <div style={{ width: s.width }} className="h-3 bg-[#FF6A00] rounded-xs" />
                  </div>
                ))}
              </div>

              {/* Containers */}
              <div className="p-5 border border-[#EFEDEB] rounded-[6px] bg-[#FAF8F6] space-y-3">
                <Label className="block mb-2">Container Bounds</Label>
                <div className="space-y-2 text-[12px]">
                  <div className="p-3 bg-white border border-[#EFEDEB] rounded-[4px] flex justify-between">
                    <span className="font-semibold text-[#151515]">Desktop Max Container</span>
                    <span className="font-mono text-[#626262]">1440px</span>
                  </div>
                  <div className="p-3 bg-white border border-[#EFEDEB] rounded-[4px] flex justify-between">
                    <span className="font-semibold text-[#151515]">Wide Content Container</span>
                    <span className="font-mono text-[#626262]">1280px</span>
                  </div>
                  <div className="p-3 bg-white border border-[#EFEDEB] rounded-[4px] flex justify-between">
                    <span className="font-semibold text-[#151515]">Standard Content Container</span>
                    <span className="font-mono text-[#626262]">1120px</span>
                  </div>
                  <div className="p-3 bg-white border border-[#EFEDEB] rounded-[4px] flex justify-between">
                    <span className="font-semibold text-[#151515]">Narrow Technical Reading Container</span>
                    <span className="font-mono text-[#626262]">768px</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 04: Radius, Borders & Shadows */}
          <section id="geometry" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">04 Geometry</Overline>
              <H2 className="mt-1">Restrained Radius, Borders & Subtle Elevation</H2>
              <Body color="muted" className="mt-1">
                Automotive design favors crisp edges and subtle surface borders over heavy roundings or blurry SaaS shadows.
              </Body>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-[#EFEDEB] rounded-[2px]">
                <span className="text-[11px] font-mono text-[#626262] block">Radius: Small (2px-3px)</span>
                <h6 className="font-semibold text-[#151515] mt-1">Tags, Inputs, Chips</h6>
                <div className="mt-4 h-12 w-full bg-[#FAF8F6] border border-[#EFEDEB] rounded-[3px] flex items-center justify-center text-[11px] font-mono">
                  rounded-[3px]
                </div>
              </div>

              <div className="p-5 bg-white border border-[#EFEDEB] rounded-[6px]">
                <span className="text-[11px] font-mono text-[#626262] block">Radius: Medium (6px)</span>
                <h6 className="font-semibold text-[#151515] mt-1">Product Cards, Modals</h6>
                <div className="mt-4 h-12 w-full bg-[#FAF8F6] border border-[#EFEDEB] rounded-[6px] flex items-center justify-center text-[11px] font-mono">
                  rounded-[6px]
                </div>
              </div>

              <div className="p-5 bg-white border border-[#EFEDEB] rounded-[8px]">
                <span className="text-[11px] font-mono text-[#626262] block">Radius: Large (8px)</span>
                <h6 className="font-semibold text-[#151515] mt-1">Media Containers</h6>
                <div className="mt-4 h-12 w-full bg-[#FAF8F6] border border-[#EFEDEB] rounded-[8px] flex items-center justify-center text-[11px] font-mono">
                  rounded-[8px]
                </div>
              </div>

              <div className="p-5 bg-white border border-[#EFEDEB] rounded-[6px]">
                <span className="text-[11px] font-mono text-[#626262] block">Radius: Pill (9999px)</span>
                <h6 className="font-semibold text-[#151515] mt-1">Status Pills Only</h6>
                <div className="mt-4 h-12 w-full bg-[#FAF8F6] border border-[#EFEDEB] rounded-full flex items-center justify-center text-[11px] font-mono">
                  rounded-full
                </div>
              </div>
            </div>
          </section>

          {/* Section 05: Custom Automotive Icons */}
          <section id="icons" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">05 Iconography</Overline>
              <H2 className="mt-1">Trionyx Native SVG Icon System</H2>
              <Body color="muted" className="mt-1">
                Crafted in-house with zero third-party icon dependencies. Precision 1.75px stroke geometry designed for technical automotive clarity.
              </Body>
            </div>

            {/* Icon Sizes */}
            <div className="p-5 bg-white border border-[#EFEDEB] rounded-[6px] space-y-4">
              <Label className="block">Standard Sizing Scale (16px, 20px, 24px, 32px)</Label>
              <div className="flex items-center gap-8 text-[12px] font-mono text-[#626262]">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={16} color="brandOrange" />
                  <span>16px (Micro)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={20} color="brandOrange" />
                  <span>20px (Default)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={24} color="brandOrange" />
                  <span>24px (Medium)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={32} color="brandOrange" />
                  <span>32px (Feature)</span>
                </div>
              </div>
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {[
                { name: 'Shield', icon: <ShieldIcon size={20} /> },
                { name: 'ShieldCheck', icon: <ShieldCheckIcon size={20} color="brandOrange" /> },
                { name: 'Droplet (Coating)', icon: <DropletIcon size={20} /> },
                { name: 'Layers (PPF)', icon: <LayersIcon size={20} /> },
                { name: 'Sparkles', icon: <SparklesIcon size={20} /> },
                { name: 'Sun (UV)', icon: <SunIcon size={20} /> },
                { name: 'Thermometer', icon: <ThermometerIcon size={20} /> },
                { name: 'Wrench (Tool)', icon: <WrenchIcon size={20} /> },
                { name: 'Search', icon: <SearchIcon size={20} /> },
                { name: 'ChevronRight', icon: <ChevronRightIcon size={20} /> },
                { name: 'ChevronDown', icon: <ChevronDownIcon size={20} /> },
                { name: 'ArrowRight', icon: <ArrowRightIcon size={20} color="brandOrange" /> },
                { name: 'Check', icon: <CheckIcon size={20} color="success" /> },
                { name: 'Close', icon: <CloseIcon size={20} /> },
                { name: 'Filter', icon: <FilterIcon size={20} /> },
                { name: 'Sliders', icon: <SlidersIcon size={20} /> },
                { name: 'AlertCircle', icon: <AlertCircleIcon size={20} color="brandRed" /> },
                { name: 'AlertTriangle', icon: <AlertTriangleIcon size={20} color="warning" /> },
                { name: 'Eye', icon: <EyeIcon size={20} /> },
                { name: 'Download', icon: <DownloadIcon size={20} /> },
                { name: 'Calendar', icon: <CalendarIcon size={20} /> },
                { name: 'Clock', icon: <ClockIcon size={20} /> },
                { name: 'Mail', icon: <MailIcon size={20} /> },
                { name: 'Phone', icon: <PhoneIcon size={20} /> },
                { name: 'MapPin', icon: <MapPinIcon size={20} /> },
                { name: 'User', icon: <UserIcon size={20} /> },
                { name: 'Upload', icon: <UploadIcon size={20} /> },
                { name: 'Minus', icon: <MinusIcon size={20} /> },
                { name: 'Info', icon: <InfoIcon size={20} /> },
                { name: 'CheckCircle', icon: <CheckCircleIcon size={20} color="success" /> },
                { name: 'ChevronLeft', icon: <ChevronLeftIcon size={20} /> },
                { name: 'ChevronUp', icon: <ChevronUpIcon size={20} /> },
                { name: 'ArrowLeft', icon: <ArrowLeftIcon size={20} /> },
                { name: 'ArrowUpRight', icon: <ArrowUpRightIcon size={20} /> },
                { name: 'Spinner', icon: <SpinnerIcon size={20} color="brandOrange" /> },
              ].map((item) => (
                <div
                  key={item.name}
                  className="p-3 bg-white border border-[#EFEDEB] rounded-[4px] flex flex-col items-center justify-center text-center gap-2 hover:border-[#D8D5D0] transition-colors"
                >
                  <div className="h-8 flex items-center justify-center">{item.icon}</div>
                  <span className="text-[10px] font-mono text-[#626262] line-clamp-1">{item.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 06: Buttons & Actions */}
          <section id="buttons" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">06 Buttons</Overline>
              <H2 className="mt-1">Button System & Interaction States</H2>
              <Body color="muted" className="mt-1">
                Primary CTA uses Trionyx Orange. Secondary actions utilize Deep Charcoal. Full state support: hover, active, focus, disabled, loading.
              </Body>
            </div>

            {/* Live Interactive State Toggles */}
            <div className="p-4 bg-[#FAF8F6] border border-[#EFEDEB] rounded-[6px] flex items-center gap-6">
              <span className="text-[12px] font-semibold uppercase font-mono text-[#151515]">
                Live State Controller:
              </span>
              <ToggleSwitch
                checked={btnLoading}
                onChange={setBtnLoading}
                label="Simulate Loading State"
              />
              <ToggleSwitch
                checked={btnDisabled}
                onChange={setBtnDisabled}
                label="Simulate Disabled State"
              />
            </div>

            {/* Matrix of Button Variants */}
            <div className="bg-white border border-[#EFEDEB] rounded-[6px] p-6 space-y-6">
              <div>
                <Label className="block mb-3">Variants Matrix (Medium 40px)</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" loading={btnLoading} disabled={btnDisabled}>
                    Primary Action
                  </Button>
                  <Button variant="secondary" loading={btnLoading} disabled={btnDisabled}>
                    Secondary Action
                  </Button>
                  <Button variant="outline" loading={btnLoading} disabled={btnDisabled}>
                    Outline Button
                  </Button>
                  <Button variant="ghost" loading={btnLoading} disabled={btnDisabled}>
                    Ghost Action
                  </Button>
                  <Button variant="destructive" loading={btnLoading} disabled={btnDisabled}>
                    Destructive Action
                  </Button>
                  <Button variant="text" loading={btnLoading} disabled={btnDisabled}>
                    Text Action
                  </Button>
                  <Button
                    variant="icon"
                    loading={btnLoading}
                    disabled={btnDisabled}
                    aria-label="Filter"
                  >
                    <SlidersIcon size={16} color="default" />
                  </Button>
                </div>
              </div>

              {/* Sizes */}
              <div className="pt-4 border-t border-[#EFEDEB]">
                <Label className="block mb-3">Sizes (Small 32px / Medium 40px / Large 48px)</Label>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="primary" leadingIcon={<PlusIcon size={14} color="inverse" />}>
                    Small CTA (32px)
                  </Button>
                  <Button size="md" variant="primary" leadingIcon={<PlusIcon size={16} color="inverse" />}>
                    Medium CTA (40px)
                  </Button>
                  <Button size="lg" variant="primary" trailingIcon={<ArrowRightIcon size={18} color="inverse" />}>
                    Large CTA (48px)
                  </Button>
                </div>
              </div>

              {/* Leading / Trailing Icons */}
              <div className="pt-4 border-t border-[#EFEDEB]">
                <Label className="block mb-3">Icon Slots</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" leadingIcon={<DownloadIcon size={16} color="default" />}>
                    Download Technical Spec
                  </Button>
                  <Button variant="secondary" trailingIcon={<ChevronRightIcon size={16} color="inverse" />}>
                    Request Installer Access
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 07: Chips & Status Pills */}
          <section id="chips-pills" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">07 Badges</Overline>
              <H2 className="mt-1">Chips vs. Status Pills</H2>
              <Body color="muted" className="mt-1">
                Strict separation of concerns: Chips are interactive filter/selection elements. Pills are read-only technical and availability metadata.
              </Body>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interactive Chips */}
              <div className="p-5 bg-white border border-[#EFEDEB] rounded-[6px] space-y-4">
                <div>
                  <h5 className="font-semibold text-[#151515]">Interactive Filter Chips</h5>
                  <Caption color="muted">Click to select/toggle category filters</Caption>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {['All Products', 'Ceramic Coating', 'Graphene Coating', 'Borophene Coating'].map((c) => (
                    <Chip
                      key={c}
                      selected={chipSelected === c}
                      onClick={() => setChipSelected(c)}
                    >
                      {c}
                    </Chip>
                  ))}
                  <Chip onRemove={() => alert('Filter cleared')} selected>
                    9H Rated
                  </Chip>
                  <Chip disabled>Certified Installer Only</Chip>
                </div>
              </div>

              {/* Status Pills */}
              <div className="p-5 bg-white border border-[#EFEDEB] rounded-[6px] space-y-4">
                <div>
                  <h5 className="font-semibold text-[#151515]">Technical Specification & Certification Pills</h5>
                  <Caption color="muted">Reserved for lab ratings and certification metadata</Caption>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill variant="neutral">ISO 9001</Pill>
                  <Pill variant="brandOrange" dot>
                    Lab Verified
                  </Pill>
                  <Pill variant="success" dot>
                    ASTM Certified
                  </Pill>
                  <Pill variant="warning" dot>
                    Installer Only
                  </Pill>
                  <Pill variant="brandRed" dot>
                    Restricted Access
                  </Pill>
                  <Pill variant="default">8.5 MIL SPEC</Pill>
                </div>
              </div>
            </div>
          </section>

          {/* Section 08: Form Controls */}
          <section id="forms" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">08 Form System</Overline>
              <H2 className="mt-1">Automotive Form Controls</H2>
              <Body color="muted" className="mt-1">
                Crisp, high-contrast form primitives with defined focus rings, validation states, and dealer inquiry inputs.
              </Body>
            </div>

            <div className="bg-white border border-[#EFEDEB] rounded-[6px] p-6 space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="search-demo">Product Search Input</FormLabel>
                  <SearchInput id="search-demo" />
                  <HelperText>Search by product name, film thickness, or chemical category</HelperText>
                </div>
                <div>
                  <FormLabel htmlFor="text-demo" required>
                    Installer Company Name
                  </FormLabel>
                  <TextInput id="text-demo" placeholder="e.g. Apex Detailing Lab" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="select-demo">Vehicle Category</FormLabel>
                  <Select id="select-demo">
                    <option>Supercars & High Performance</option>
                    <option>Commercial Fleet Protection</option>
                    <option>Passenger Sedan & SUV</option>
                    <option>Off-Road / Utility</option>
                  </Select>
                </div>
                <div>
                  <FormLabel htmlFor="error-demo">Validation State Example</FormLabel>
                  <TextInput id="error-demo" defaultValue="invalid-tax-id" error />
                  <ErrorMessage>Invalid certified tax or dealer identifier</ErrorMessage>
                </div>
              </div>

              <div>
                <FormLabel htmlFor="textarea-demo">Technical Specifications & Notes</FormLabel>
                <Textarea
                  id="textarea-demo"
                  placeholder="Provide vehicle paint condition, clearcoat type, and installation temperature range..."
                />
              </div>

              {/* Checkbox and Radio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <FormLabel>Selection Checkboxes</FormLabel>
                  <div className="space-y-2">
                    <Checkbox
                      label="Automotive Ceramic Coating Specialist"
                      description="Certified installer access included"
                      defaultChecked
                    />
                    <Checkbox
                      label="Paint Protection Film (PPF) Certified"
                      description="Requires verified plotter cutting equipment"
                    />
                    <Checkbox label="Restricted Product Access" disabled />
                  </div>
                </div>

                <div className="space-y-3">
                  <FormLabel>Radio Group</FormLabel>
                  <div className="space-y-2">
                    <Radio
                      name="pricing-tier"
                      label="Direct Wholesale Tier"
                      description="Minimum order: 50 units / month"
                      checked={radioVal === 'option1'}
                      onChange={() => setRadioVal('option1')}
                    />
                    <Radio
                      name="pricing-tier"
                      label="Certified Installer Tier"
                      description="Includes marketing collateral and lead referrals"
                      checked={radioVal === 'option2'}
                      onChange={() => setRadioVal('option2')}
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="pt-2">
                <FormLabel>Specification Preferences Toggle</FormLabel>
                <div className="p-3.5 bg-[#FAF8F6] border border-[#EFEDEB] rounded-[4px] flex items-center justify-between">
                  <ToggleSwitch
                    id="spec-metric-toggle"
                    checked={toggleState}
                    onChange={setToggleState}
                    label="Display High-Precision Laboratory Mil Ratings"
                  />
                  <span className="text-[11px] font-mono text-[#626262]">
                    State: {toggleState ? 'ENABLED' : 'STANDARD'}
                  </span>
                </div>
              </div>

              {/* File Input */}
              <div className="pt-2">
                <FormLabel>Technical Document Upload</FormLabel>
                <FileInput label="Upload business license or lab certification" />
              </div>
            </div>
          </section>

          {/* Section 09: Purpose-Built Cards */}
          <section id="cards" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">09 Cards</Overline>
              <H2 className="mt-1">Content-Purpose Card Architecture</H2>
              <Body color="muted" className="mt-1">
                Tailored cards that preserve automotive product imagery without generic SaaS clutter.
              </Body>
            </div>

            {/* 1. Product Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <H4>1. Automotive Product Cards (Discovery & Enquiry)</H4>
                  <Caption color="muted">
                    Clean, non-ecommerce presentation prioritizing dominant imagery, refined typography, and clean discovery action.
                  </Caption>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProductCard
                  name="Ceramic Coating"
                  onViewProduct={() => alert('View Product: Ceramic Coating')}
                />

                <ProductCard
                  name="Graphene Coating"
                  onViewProduct={() => alert('View Product: Graphene Coating')}
                />

                <ProductCard
                  name="Borophene Coating"
                  onViewProduct={() => alert('View Product: Borophene Coating')}
                />
              </div>
            </div>

            {/* 2. Category Cards */}
            <div className="pt-6">
              <H4 className="mb-4">2. Product Category Cards</H4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ProductCategoryCard
                  title="Ceramic Coating"
                  productCount={1}
                  featuredSpec="Surface Defense"
                  description="High-clarity protective clearcoat formulation engineered for molecular surface bonding."
                />
                <ProductCategoryCard
                  title="Graphene Coating"
                  productCount={1}
                  featuredSpec="Advanced Matrix"
                  description="Reinforced carbon-matrix surface formulation with extreme hydrophobic tension."
                />
                <ProductCategoryCard
                  title="Borophene Coating"
                  productCount={1}
                  featuredSpec="Molecular Shield"
                  description="Next-generation atomic-grade surface coating engineered for extreme resilience."
                />
              </div>
            </div>

            {/* 3. Media, Info & Feature Cards */}
            <div className="pt-6">
              <H4 className="mb-4">3. Media, Technical Metric & Feature Cards</H4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MediaCard
                  category="Technical Laboratory"
                  title="ASTM Gravel Impact Resistance Test"
                  durationOrDate="4:22 MIN"
                  aspectRatio="video"
                />
                <InfoCard
                  label="Surface Hardness Standard"
                  metric="9.2H"
                  description="Independently verified pencil hardness rating according to ASTM D3363 testing."
                  subtext="Tested on OEM high-solid automotive clearcoats."
                />
                <FeatureCard
                  icon={<DropletIcon size={20} color="brandOrange" />}
                  title="118° Water Contact Angle"
                  description="Extreme hydrophobic surface tension causes water, mud, and contaminants to slide off instantly."
                  badge="Hydrophobic"
                />
              </div>
            </div>

            {/* 4. Article & Contact Cards */}
            <div className="pt-6">
              <H4 className="mb-4">4. Content & Dealer Enquiry Cards</H4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ArticleCard
                  category="Installation Guide"
                  date="September 2026"
                  readTime="6 min read"
                  title="Proper Clearcoat Decontamination Prior to Matrix-9H Application"
                  excerpt="Detailed protocol covering iron fallout neutralization, clay bar lubrication, and isopropyl alcohol wipe-downs for permanent ceramic bonding."
                />
                <ContactCard
                  title="Apply for Certified Installer Status"
                  description="Access wholesale tier pricing, priority shipping, technical warranty coverage, and regional dealer referral leads."
                  buttonText="Submit Dealer Application"
                  supportNote="Dedicated technical representative assigned in 24 hours"
                  onAction={() => alert('Dealer application form modal')}
                />
              </div>
            </div>
          </section>

          {/* Section 10: Product UI Primitives */}
          <section id="product-ui" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">10 Product Primitives</Overline>
              <H2 className="mt-1">Reusable Product Building Blocks</H2>
              <Body color="muted" className="mt-1">
                Modular primitives that scale across coatings, films, lighting, and future product lines.
              </Body>
            </div>

            <div className="bg-white border border-[#EFEDEB] rounded-[6px] p-6 space-y-8">
              {/* Product Image Frame */}
              <div>
                <Label className="block mb-3">Product Image Frame (Aspect 4:3 with Lab Spec Placeholder)</Label>
                <div className="max-w-md">
                  <ProductImageFrame aspectRatio="4/3">
                    <div className="absolute bottom-3 left-3">
                      <Pill variant="brandOrange" size="sm" dot>
                        Active Production Spec
                      </Pill>
                    </div>
                  </ProductImageFrame>
                </div>
              </div>

              {/* Product Spec Rows */}
              <div>
                <Label className="block mb-3">Product Specification Rows</Label>
                <div className="max-w-md bg-[#FAF8F6] p-4 border border-[#EFEDEB] rounded-[4px]">
                  <ProductSpecRow label="Film Thickness" value="8.5" unit="MIL" testStandard="ASTM D1000" />
                  <ProductSpecRow label="Elongation at Break" value="420" unit="%" testStandard="ASTM D882" />
                  <ProductSpecRow label="UV Blocking" value="99.4" unit="%" testStandard="ISO 9050" />
                  <ProductSpecRow label="Self-Healing Temp" value="60" unit="°C / 140°F" />
                </div>
              </div>

              {/* Product Attribute Badges */}
              <div>
                <Label className="block mb-3">Product Attribute Badges</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <ProductAttributeBadge
                    icon={<ShieldCheckIcon size={18} color="brandOrange" />}
                    label="Hardness"
                    value="9.2H Pencil"
                  />
                  <ProductAttributeBadge
                    icon={<DropletIcon size={18} color="brandOrange" />}
                    label="Hydrophobic"
                    value="118° Angle"
                  />
                  <ProductAttributeBadge
                    icon={<SunIcon size={18} color="brandOrange" />}
                    label="UV Defense"
                    value="Class A"
                  />
                  <ProductAttributeBadge
                    icon={<ThermometerIcon size={18} color="brandOrange" />}
                    label="Thermal Limit"
                    value="450°C"
                  />
                </div>
              </div>

              {/* Gallery Thumbnails */}
              <div>
                <Label className="block mb-3">Product Gallery Thumbnails</Label>
                <div className="flex items-center gap-2">
                  {['Front 45°', 'Bottle', 'Box Spec', 'Installed'].map((label, idx) => (
                    <ProductGalleryThumbnail
                      key={label}
                      active={activeThumb === idx}
                      label={label}
                      onClick={() => setActiveThumb(idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Related Item */}
              <div>
                <Label className="block mb-3">Compact Related Item</Label>
                <div className="max-w-md">
                  <ProductRelatedItem
                    category="Companion Coating"
                    title="Trionyx Hydro-Boost Topcoat"
                    onClick={() => alert('View related item')}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Navigation Primitives */}
          <section id="navigation" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">11 Navigation</Overline>
              <H2 className="mt-1">Navigation Primitives (No Final Site Header Yet)</H2>
              <Body color="muted" className="mt-1">
                Building blocks for eventual site assembly: Nav links, dropdown items, breadcrumbs, back actions, and pagination.
              </Body>
            </div>

            <div className="bg-white border border-[#EFEDEB] rounded-[6px] p-6 space-y-6">
              {/* Breadcrumb */}
              <div>
                <Label className="block mb-3">Breadcrumb</Label>
                <Breadcrumb
                  items={[
                    { label: 'Catalog' },
                    { label: 'Coatings' },
                    { label: 'Ceramic Coating', active: true },
                  ]}
                />
              </div>

              {/* Nav Links */}
              <div className="pt-4 border-t border-[#EFEDEB]">
                <Label className="block mb-3">Navigation Links</Label>
                <div className="flex items-center gap-2">
                  <NavLink active>Ceramic Coating</NavLink>
                  <NavLink>Graphene Coating</NavLink>
                  <NavLink>Borophene Coating</NavLink>
                  <NavLink>Dealer Portal</NavLink>
                </div>
              </div>

              {/* Dropdown Items & Mega Menu */}
              <div className="pt-4 border-t border-[#EFEDEB]">
                <Label className="block mb-3">Dropdown & Mega Menu Primitives</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <DropdownItem
                    icon={<DropletIcon size={16} color="default" />}
                    title="Ceramic Coating"
                    description="Molecular surface clearcoat bond formulation"
                  />
                  <DropdownItem
                    icon={<LayersIcon size={16} color="default" />}
                    title="Graphene Coating"
                    description="High-durability carbon matrix formulation"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mt-4">
                  <MegaMenuItem
                    category="Confirmed Formulation"
                    title="Ceramic Coating"
                    specHighlights="Surface Defense • Optical Clarity"
                  />
                  <MegaMenuItem
                    category="Confirmed Formulation"
                    title="Borophene Coating"
                    specHighlights="Molecular Shield • Atomic Resilience"
                  />
                </div>
              </div>

              {/* Mobile Nav Item Preview */}
              <div className="pt-4 border-t border-[#EFEDEB]">
                <Label className="block mb-3">Mobile Navigation Primitive</Label>
                <div className="max-w-md bg-white border border-[#EFEDEB] rounded-[4px] overflow-hidden">
                  <MobileNavItem title="Ceramic Coating" active badge="Confirmed" />
                  <MobileNavItem title="Graphene Coating" />
                  <MobileNavItem title="Borophene Coating" />
                </div>
              </div>

              {/* Back Action & Pagination */}
              <div className="pt-4 border-t border-[#EFEDEB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <BackAction onClick={() => alert('Back')} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={4}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </section>

          {/* Section 12: Feedback & Dialogs */}
          <section id="feedback" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">12 Feedback</Overline>
              <H2 className="mt-1">Alerts, Modals, Drawers & Skeletons</H2>
              <Body color="muted" className="mt-1">
                Production feedback primitives for technical validations, notifications, and dealer enquiry workflows.
              </Body>
            </div>

            {/* Interactive Triggers */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                Open Technical Specification Modal
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
                Open Dealer Filter Drawer
              </Button>
            </div>

            {/* Alert Variants */}
            <div className="space-y-3">
              <Alert
                variant="info"
                title="Laboratory Notice"
                description="Trionyx Matrix-9H requires a minimum 12-hour dry cure before exposure to moisture."
                onClose={() => alert('Closed alert')}
              />
              <Alert
                variant="success"
                title="Certification Verified"
                description="Your installer tax credential has been approved for wholesale tier allocation."
              />
              <Alert
                variant="warning"
                title="Installation Temperature Threshold"
                description="Ambient application temperature is below 15°C (59°F). Infrared curing lamps recommended."
              />
              <Alert
                variant="error"
                title="Chemical Incompatibility"
                description="Do not apply solvent-based wax or petroleum dressings over uncured PPF film edges."
              />
            </div>

            {/* Toast & Tooltip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <Label className="block">Toast Notification</Label>
                <Toast
                  variant="success"
                  title="Specification Downloaded"
                  message="Matrix-9H-ASTM-Lab-Report.pdf saved to downloads."
                  onDismiss={() => alert('Dismissed toast')}
                />
              </div>

              <div className="space-y-3">
                <Label className="block">Interactive Tooltip</Label>
                <div>
                  <Tooltip content="ASTM D3363 Standard Test Method for Film Hardness by Pencil Test">
                    <span className="cursor-help font-mono text-[13px] underline decoration-dotted decoration-[#FF6A00] text-[#151515]">
                      Hover to view ASTM test definition
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Skeleton Loaders & Empty State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 border border-[#EFEDEB] rounded-[6px] bg-white space-y-3">
                <Label className="block">Skeleton Loading State</Label>
                <Skeleton height="18px" width="60%" />
                <Skeleton height="14px" width="90%" />
                <Skeleton height="14px" width="75%" />
                <Skeleton height="36px" width="40%" className="mt-4" />
              </div>

              <div>
                <EmptyState
                  icon={<SearchIcon size={28} color="muted" />}
                  title="No Technical Specifications Found"
                  description="No certified coatings match the selected chemical filter criteria. Try clearing active filters."
                  actionLabel="Reset All Filters"
                  onAction={() => alert('Filters reset')}
                />
              </div>
            </div>

            {/* Inline Loading Indicator */}
            <div className="p-4 bg-[#FAF8F6] border border-[#EFEDEB] rounded-[4px] flex items-center justify-between">
              <LoadingIndicator label="Querying certified automotive film catalog database..." />
              <span className="text-[11px] font-mono text-[#626262]">Live Connection</span>
            </div>
          </section>

          {/* Section 13: Motion & Transitions */}
          <section id="motion" className="space-y-6">
            <div className="border-b border-[#EFEDEB] pb-3">
              <Overline color="brandOrange">13 Motion</Overline>
              <H2 className="mt-1">Restrained Motion Tokens</H2>
              <Body color="muted" className="mt-1">
                Zero floaty AI animations. Fast (120ms) for micro-interactions, standard (200ms) for surface transitions.
              </Body>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-[#EFEDEB] rounded-[4px] text-[13px]">
                <span className="font-mono text-[11px] text-[#FF6A00] block mb-1">Fast (120ms)</span>
                <span className="font-semibold text-[#151515] block">Micro-Interactions</span>
                <p className="text-[11px] text-[#626262] mt-1">Button hovers, chip selections, focus rings</p>
              </div>
              <div className="p-4 bg-white border border-[#EFEDEB] rounded-[4px] text-[13px]">
                <span className="font-mono text-[11px] text-[#FF6A00] block mb-1">Standard (200ms)</span>
                <span className="font-semibold text-[#151515] block">Surface Transitions</span>
                <p className="text-[11px] text-[#626262] mt-1">Card elevation, dropdown expansion, image zoom</p>
              </div>
              <div className="p-4 bg-white border border-[#EFEDEB] rounded-[4px] text-[13px]">
                <span className="font-mono text-[11px] text-[#FF6A00] block mb-1">Slow (350ms)</span>
                <span className="font-semibold text-[#151515] block">Overlay Transitions</span>
                <p className="text-[11px] text-[#626262] mt-1">Modal backdrops, sliding drawers</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Interactive Modal Component Demo */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Trionyx Matrix-9H Laboratory Spec Sheet"
        subtitle="Certified ASTM D3363 Independent Evaluation"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              trailingIcon={<DownloadIcon size={14} color="inverse" />}
              onClick={() => {
                alert('Downloading spec PDF...');
                setModalOpen(false);
              }}
            >
              Download PDF Report
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[13px]">
          <p className="text-[#626262] leading-relaxed">
            Matrix-9H underwent 2,000 hours of accelerated QUV weathering and mechanical abrasion.
            The results below reflect the final recorded values before clearcoat wear:
          </p>
          <div className="border border-[#EFEDEB] rounded-[4px] p-3 bg-[#FAF8F6] space-y-1 text-[12px] font-mono">
            <div className="flex justify-between py-1 border-b border-[#EFEDEB]">
              <span>Pencil Hardness:</span>
              <span className="font-bold text-[#151515]">9.2H Verified</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#EFEDEB]">
              <span>Water Beading Angle:</span>
              <span className="font-bold text-[#151515]">118° Initial</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#EFEDEB]">
              <span>Chemical Tolerance:</span>
              <span className="font-bold text-[#151515]">pH 2 to pH 13</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Thickness per Coat:</span>
              <span className="font-bold text-[#151515]">1.5 - 2.0 Microns</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Interactive Drawer Component Demo */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filter Certified Products"
      >
        <div className="space-y-5 text-[13px]">
          <div>
            <FormLabel>Protection Category</FormLabel>
            <div className="space-y-2 mt-2">
              <Checkbox label="Ceramic Coating" defaultChecked />
              <Checkbox label="Graphene Coating" defaultChecked />
              <Checkbox label="Borophene Coating" defaultChecked />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EFEDEB]">
            <FormLabel>Minimum Durability Rating</FormLabel>
            <Select defaultValue="3">
              <option value="1">1+ Year Lab Tested</option>
              <option value="3">3+ Years Guaranteed</option>
              <option value="5">5+ Years Professional</option>
              <option value="10">10-Year Lifetime PPF</option>
            </Select>
          </div>

          <div className="pt-6">
            <Button variant="primary" fullWidth onClick={() => setDrawerOpen(false)}>
              Apply 14 Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

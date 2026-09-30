'use client';

import React, { useState } from 'react';

export type WorkspaceTone = 'default' | 'danger' | 'warning' | 'accent' | 'success';

export interface WorkspaceViewItem {
  id: string;
  label: string;
  trailing?: React.ReactNode;
}

export interface WorkspaceViewSection {
  id?: string;
  title?: string;
  meta?: React.ReactNode;
  items: WorkspaceViewItem[];
}

export interface WorkspaceSummaryItem {
  label: string;
  value: React.ReactNode;
  tone?: WorkspaceTone;
}

export interface WorkspaceViewsConfig {
  title?: string;
  sections: WorkspaceViewSection[];
  activeId: string;
  onSelect: (id: string) => void;
  summary?: WorkspaceSummaryItem[];
  storageKey?: string;
}

const HAIRLINE = 'border-[var(--border)]';

const valueToneClass: Record<WorkspaceTone, string> = {
  default: 'text-[var(--text-primary)]',
  danger: 'text-[var(--status-danger)]',
  warning: 'text-[var(--status-warning)]',
  accent: 'text-[var(--accent)]',
  success: 'text-[var(--status-success)]',
};

export function WorkspaceSidebar({
  title = 'Workspace Views',
  sections,
  activeId,
  onSelect,
  summary,
  storageKey = 'trionyx-workspace-collapsed',
}: WorkspaceViewsConfig) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? '1' : '0');
      } catch {
        // Ignore persistence failures.
      }
      return next;
    });
  };

  return (
    <aside
      aria-label={title}
      className={`hidden lg:flex shrink-0 flex-col bg-[var(--surface-raised)] border-r ${HAIRLINE} sticky top-0 h-screen overflow-hidden transition-[width] duration-200 ${
        collapsed ? 'w-[60px]' : 'w-64'
      }`}
    >
      {/* Header + collapse control */}
      <div
        className={`flex items-center h-11 shrink-0 border-b ${HAIRLINE} ${
          collapsed ? 'justify-center px-0' : 'justify-between px-3'
        }`}
      >
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
            {title}
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand workspace views' : 'Collapse workspace views'}
          title={collapsed ? 'Expand' : 'Collapse'}
          className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Views */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-3">
        {sections.map((section, si) => (
          <div key={section.id ?? si}>
            {!collapsed && (section.title || section.meta) && (
              <div className="px-2 pb-1 flex items-center justify-between gap-2">
                {section.title && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
                    {section.title}
                  </span>
                )}
                {section.meta && (
                  <span className="text-[11px] text-[var(--text-muted)] shrink-0">{section.meta}</span>
                )}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left rounded-[3px] text-[13px] flex items-center transition-colors cursor-pointer ${
                      collapsed ? 'justify-center px-0 py-2' : 'justify-between px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    {collapsed ? (
                      <span className="flex items-center justify-center w-5 h-5 shrink-0">
                        <span className="text-[11px] font-bold uppercase">{item.label.charAt(0)}</span>
                      </span>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.trailing !== undefined ? (
                          <span className="text-[11px] font-normal text-[var(--text-muted)] shrink-0 ml-2">
                            {item.trailing}
                          </span>
                        ) : null}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Summary */}
      {summary && summary.length > 0 && !collapsed && (
        <div className={`shrink-0 border-t ${HAIRLINE} p-3 text-[12px] space-y-1.5`}>
          {summary.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-[var(--text-secondary)] truncate">{s.label}</span>
              <span className={`font-semibold tabular-nums shrink-0 ${valueToneClass[s.tone ?? 'default']}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

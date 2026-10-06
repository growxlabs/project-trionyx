import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

export const trixCatalog = defineCatalog(schema, {
  components: {
    CardContainer: {
      props: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        badge: z.string().optional(),
      }),
      slots: ['default', 'actions'],
      description: 'Main card container with title, optional subtitle, and actions slot',
    },
    MetricGrid: {
      props: z.object({
        columns: z.number().optional(),
      }),
      slots: ['default'],
      description: 'Grid layout for arranging MetricCard tiles side-by-side',
    },
    MetricCard: {
      props: z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        subtext: z.string().optional(),
        tone: z.enum(['neutral', 'success', 'warning', 'danger', 'info']).optional(),
      }),
      description: 'KPI stat tile with primary figure, label, and status tone',
    },
    StatusPill: {
      props: z.object({
        status: z.string(),
        tone: z.enum(['neutral', 'success', 'warning', 'danger', 'info']).optional(),
        label: z.string().optional(),
      }),
      description: 'Color-coded operational status pill badge',
    },
    PropertyGrid: {
      props: z.object({
        items: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        ),
        columns: z.number().optional(),
      }),
      description: 'Two-column key-value attribute list',
    },
    DataTable: {
      props: z.object({
        columns: z.array(
          z.object({
            key: z.string(),
            label: z.string(),
          })
        ),
        rows: z.array(
          z.object({
            key: z.string(),
            title: z.string(),
            subtitle: z.string().optional(),
            detail: z.string().optional(),
            status: z.string().optional(),
            href: z.string().optional(),
          })
        ),
        emptyText: z.string().optional(),
      }),
      description: 'Interactive data table with record titles, subtexts, status badges, and links',
    },
    Timeline: {
      props: z.object({
        items: z.array(
          z.object({
            key: z.string(),
            title: z.string(),
            subtitle: z.string().optional(),
            detail: z.string().optional(),
            status: z.string().optional(),
            href: z.string().optional(),
            timestamp: z.string().optional(),
          })
        ),
        emptyText: z.string().optional(),
      }),
      description: 'Chronological timeline showing serial movements or assignment changes',
    },
    Callout: {
      props: z.object({
        title: z.string(),
        description: z.string().optional(),
        severity: z.enum(['info', 'warning', 'danger', 'success']).optional(),
        href: z.string().optional(),
      }),
      description: 'Attention or warning callout banner for exceptions',
    },
    QuickAction: {
      props: z.object({
        label: z.string(),
        href: z.string().optional(),
        variant: z.enum(['primary', 'outline', 'ghost']).optional(),
      }),
      description: 'Quick action button or link',
    },
    CustomerQuote: {
      props: z.object({
        message: z.string(),
        truncated: z.boolean().optional(),
      }),
      description: 'Read-only customer message quote box',
    },
  },
  actions: {},
});

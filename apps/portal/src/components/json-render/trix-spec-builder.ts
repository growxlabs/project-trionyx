import type { ResultResponse } from '../../app/trix/TrixResultCards';

const of = (shown: number, total: number) => (shown === total ? `${total}` : `${shown} of ${total}`);
const path = (base: string, id: string) => `${base}/${encodeURIComponent(id)}`;
const place = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(', ');
const words = (value: string) =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
const change = (from: string | null, to: string | null) => `${from ?? 'None'} → ${to ?? 'None'}`;

function age(minutes: number) {
  if (minutes < 60) return `${minutes} min old`;
  const hours = Math.floor(minutes / 60);
  return hours < 48 ? `${hours} h old` : `${Math.floor(hours / 24)} days old`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  const day = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return day;
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(date);
  return `${day} · ${time}`;
}

function mapSeverity(severity: string): 'info' | 'warning' | 'danger' | 'success' {
  const s = severity.toLowerCase();
  if (s === 'critical' || s === 'danger' || s === 'error') return 'danger';
  if (s === 'warn' || s === 'warning' || s === 'high') return 'warning';
  if (s === 'info' || s === 'low') return 'info';
  return 'info';
}

class SpecBuilder {
  private rootId = '';
  private elements: Record<string, { type: string; props: Record<string, unknown>; children?: string[]; slots?: Record<string, string[]> }> = {};
  private counter = 0;

  add(type: string, props: Record<string, unknown>, children?: string[], slots?: Record<string, string[]>): string {
    const id = `el-${++this.counter}`;
    this.elements[id] = {
      type,
      props,
      ...(children && children.length > 0 ? { children } : {}),
      ...(slots ? { slots } : {}),
    };
    return id;
  }

  setRoot(id: string) {
    this.rootId = id;
    return this;
  }

  build() {
    return {
      root: this.rootId,
      elements: this.elements,
    };
  }
}

export function buildTrixSpec(response: ResultResponse) {
  const b = new SpecBuilder();

  switch (response.type) {
    case 'inventory_list': {
      const tableId = b.add('DataTable', {
        columns: [
          { key: 'serial', label: 'Serial & Product' },
          { key: 'status', label: 'Status' },
        ],
        rows: response.items.map((item) => ({
          key: item.id,
          title: item.serialNumber,
          href: path('/inventory/serials', item.id),
          status: item.status,
          subtitle: `${item.product.name} · ${item.location?.name ?? 'No location'}`,
        })),
        emptyText: 'No serials match.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Inventory Serials',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [tableId]
      );
      return b.setRoot(root).build();
    }

    case 'inventory_summary': {
      const metricCards = response.groups.map((group) =>
        b.add('MetricCard', {
          label: group.label,
          value: group.count,
          tone: 'neutral',
        })
      );
      const gridId = b.add('MetricGrid', { columns: 3 }, metricCards);
      const root = b.add(
        'CardContainer',
        {
          title: `Inventory by ${words(response.groupBy)}`,
          badge: `Total ${response.total}`,
        },
        [gridId]
      );
      return b.setRoot(root).build();
    }

    case 'serial_movements': {
      const timelineId = b.add('Timeline', {
        items: response.items.map((item) => ({
          key: item.id,
          title: item.serialNumber,
          href: path('/inventory/serials', item.serialId),
          status: item.movementType,
          subtitle: `${item.fromLocationName ? `${item.fromLocationName} → ` : ''}${item.toLocationName ?? 'No location'}`,
          timestamp: formatDateTime(item.occurredAt),
        })),
        emptyText: 'No movements in this window.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Serial Movements',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [timelineId]
      );
      return b.setRoot(root).build();
    }

    case 'inventory_exceptions': {
      const calloutIds = response.items.map((item, index) =>
        b.add('Callout', {
          title: item.label,
          description: item.description,
          severity: mapSeverity(item.severity),
        })
      );
      const root = b.add(
        'CardContainer',
        {
          title: 'Inventory Exceptions',
          badge: `${response.totalExceptions} conditions`,
        },
        calloutIds
      );
      return b.setRoot(root).build();
    }

    case 'dealer_list': {
      const tableId = b.add('DataTable', {
        columns: [
          { key: 'dealer', label: 'Dealer & Location' },
          { key: 'status', label: 'Status' },
        ],
        rows: response.items.map((item) => ({
          key: item.id,
          title: item.businessName,
          href: path('/dealers', item.id),
          status: item.status,
          subtitle: `${item.dealerCode} · ${place(item.city, item.state)}`,
          detail: `Distributor: ${item.assignedDistributor?.businessName ?? 'Unassigned'}`,
        })),
        emptyText: 'No dealers match.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Dealers',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [tableId]
      );
      return b.setRoot(root).build();
    }

    case 'distributor_list': {
      const tableId = b.add('DataTable', {
        columns: [
          { key: 'distributor', label: 'Distributor & Location' },
          { key: 'status', label: 'Status' },
        ],
        rows: response.items.map((item) => ({
          key: item.id,
          title: item.businessName,
          href: path('/distributors', item.id),
          status: item.status,
          subtitle: `${item.distributorCode} · ${place(item.city, item.state)}`,
          detail: `${item.dealerCount} ${item.dealerCount === 1 ? 'dealer' : 'dealers'}`,
        })),
        emptyText: 'No distributors match.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Distributors',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [tableId]
      );
      return b.setRoot(root).build();
    }

    case 'dealer_network_summary': {
      const topCards = [
        b.add('MetricCard', {
          label: 'Total Dealers',
          value: response.totalDealers,
          tone: 'neutral',
        }),
        b.add('MetricCard', {
          label: 'Distributors',
          value: response.totalDistributors,
          tone: 'info',
        }),
      ];
      const topGrid = b.add('MetricGrid', { columns: 2 }, topCards);

      const groupCards = response.groups.map((g) =>
        b.add('MetricCard', {
          label: g.label,
          value: g.count,
          tone: 'neutral',
        })
      );
      const groupsGrid = b.add('MetricGrid', { columns: 3 }, groupCards);

      const root = b.add(
        'CardContainer',
        {
          title: `Dealers by ${words(response.groupBy)}`,
        },
        [topGrid, groupsGrid]
      );
      return b.setRoot(root).build();
    }

    case 'dealer_assignment_history': {
      const timelineId = b.add('Timeline', {
        items: response.items.map((item) => ({
          key: item.id,
          title: item.dealerName,
          href: path('/dealers', item.dealerId),
          subtitle: change(item.previousDistributorName, item.newDistributorName),
          timestamp: formatDateTime(item.changedAt),
        })),
        emptyText: 'No assignment changes recorded.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Distributor Assignments',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [timelineId]
      );
      return b.setRoot(root).build();
    }

    case 'dealer_network_exceptions': {
      const calloutIds = response.items.map((item) =>
        b.add('Callout', {
          title: item.label,
          description: item.description,
          severity: mapSeverity(item.severity),
          href: path('/dealers', item.recordId),
        })
      );
      const root = b.add(
        'CardContainer',
        {
          title: 'Dealer Network Attention',
          badge: `${response.totalExceptions} conditions`,
        },
        calloutIds
      );
      return b.setRoot(root).build();
    }

    case 'enquiry_list': {
      const tableId = b.add('DataTable', {
        columns: [
          { key: 'enquiry', label: 'Enquiry & Customer' },
          { key: 'status', label: 'Status' },
        ],
        rows: response.items.map((item) => ({
          key: item.id,
          title: `${item.enquiryCode} · ${item.fullName}`,
          href: path('/enquiries', item.id),
          status: item.status,
          subtitle: `${words(item.type)} · ${place(item.city, item.state)}`,
          detail: `${item.owner?.displayName ?? 'Unassigned'} · ${age(item.ageMinutes)}`,
        })),
        emptyText: 'No enquiries match.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Enquiries',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [tableId]
      );
      return b.setRoot(root).build();
    }

    case 'enquiry_detail': {
      const enquiry = response.enquiry;
      const propGridId = b.add('PropertyGrid', {
        items: [
          { label: 'Customer', value: `${enquiry.fullName}${enquiry.companyName ? ` (${enquiry.companyName})` : ''}` },
          { label: 'Type', value: words(enquiry.type) },
          { label: 'Owner', value: enquiry.owner?.displayName ?? 'Unassigned' },
          { label: 'Phone', value: enquiry.phone },
          { label: 'Email', value: enquiry.email ?? 'Not provided' },
          { label: 'Location', value: place(enquiry.city, enquiry.state, enquiry.pincode) || 'Not specified' },
          { label: 'Received', value: formatDateTime(enquiry.createdAt) },
        ],
        columns: 2,
      });

      const quoteId = b.add('CustomerQuote', {
        message: enquiry.message,
        truncated: enquiry.messageTruncated,
      });

      const actionId = b.add('QuickAction', {
        label: 'Open Enquiry',
        href: path('/enquiries', enquiry.id),
        variant: 'primary',
      });

      const root = b.add(
        'CardContainer',
        {
          title: enquiry.enquiryCode,
          badge: words(enquiry.status),
        },
        [propGridId, quoteId],
        { actions: [actionId] }
      );
      return b.setRoot(root).build();
    }

    case 'enquiry_summary': {
      const cards = response.groups.map((group) =>
        b.add('MetricCard', {
          label: words(group.label),
          value: group.count,
          tone: 'neutral',
        })
      );
      const gridId = b.add('MetricGrid', { columns: 3 }, cards);
      const root = b.add(
        'CardContainer',
        {
          title: `Enquiries by ${words(response.groupBy)}`,
          badge: `Total ${response.total}`,
        },
        [gridId]
      );
      return b.setRoot(root).build();
    }

    case 'enquiry_attention': {
      const calloutIds = response.items.map((item) =>
        b.add('Callout', {
          title: `${item.enquiryCode} · ${item.label}`,
          description: `${item.description} · ${age(item.ageMinutes)}`,
          severity: mapSeverity(item.severity),
          href: path('/enquiries', item.enquiryId),
        })
      );
      const root = b.add(
        'CardContainer',
        {
          title: 'Enquiries Needing Attention',
          badge: of(response.items.length, response.pageInfo.total),
        },
        calloutIds
      );
      return b.setRoot(root).build();
    }

    case 'enquiry_changes': {
      const timelineId = b.add('Timeline', {
        items: response.items.map((item) => ({
          key: item.id,
          title: `${item.enquiryCode} · ${words(item.changeType)}`,
          href: path('/enquiries', item.enquiryId),
          subtitle: item.previousValue || item.newValue ? change(item.previousValue, item.newValue) : undefined,
          timestamp: formatDateTime(item.occurredAt),
        })),
        emptyText: 'No enquiry changes recorded.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Enquiry Changes',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [timelineId]
      );
      return b.setRoot(root).build();
    }

    case 'warranty_list': {
      const tableId = b.add('DataTable', {
        columns: [
          { key: 'warranty', label: 'Serial & Product' },
          { key: 'status', label: 'Status' },
        ],
        rows: response.items.map((item) => ({
          key: item.warrantyId,
          title: item.serialNumber,
          href: path('/warranty', item.warrantyId),
          status: item.status,
          subtitle: `${item.productName} · ${item.dealerName ?? 'No dealer'}`,
          detail: `${formatDateTime(item.startDate)} to ${formatDateTime(item.expiryDate)}`,
        })),
        emptyText: 'No warranties match.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Warranties',
          badge: of(response.items.length, response.pageInfo.total),
        },
        [tableId]
      );
      return b.setRoot(root).build();
    }

    case 'warranty_summary': {
      const cards = response.groups.map((group) =>
        b.add('MetricCard', {
          label: words(group.label),
          value: group.count,
          tone: 'neutral',
        })
      );
      const gridId = b.add('MetricGrid', { columns: 3 }, cards);
      const root = b.add(
        'CardContainer',
        {
          title: `Warranties by ${words(response.groupBy)}`,
          badge: `Total ${response.total}`,
        },
        [gridId]
      );
      return b.setRoot(root).build();
    }

    case 'warranty_exceptions': {
      const calloutIds = response.items.map((item) =>
        b.add('Callout', {
          title: words(item.rule),
          description: `Record ${item.recordId}`,
          severity: mapSeverity(item.severity),
        })
      );
      const root = b.add(
        'CardContainer',
        {
          title: 'Warranty Attention',
          badge: of(response.items.length, response.pageInfo.total),
        },
        calloutIds
      );
      return b.setRoot(root).build();
    }

    case 'operational_changes': {
      const timelineId = b.add('Timeline', {
        items: response.items.map((item) => ({
          key: item.id,
          title: words(item.event),
          subtitle: words(item.module),
          timestamp: formatDateTime(item.occurredAt),
        })),
        emptyText: 'No activity recorded in this window.',
      });
      const root = b.add(
        'CardContainer',
        {
          title: 'Operational Activity',
          subtitle: `${formatDateTime(response.window.from)} to ${formatDateTime(response.window.to)}`,
          badge: of(response.items.length, response.pageInfo.total),
        },
        [timelineId]
      );
      return b.setRoot(root).build();
    }

    case 'executive_overview': {
      const { inventory, dealers, enquiries, warranties, attention, activity } = response;
      const attentionTotal =
        attention.inventory.total + attention.dealers.total + attention.enquiries.total + attention.warranties.total;

      const metricCards = [
        b.add('MetricCard', {
          label: 'Inventory',
          value: `${inventory.availableSerials} / ${inventory.totalSerials}`,
          subtext: 'Available Serials',
          tone: 'success',
        }),
        b.add('MetricCard', {
          label: 'Dealer Network',
          value: `${dealers.activeDealers} / ${dealers.totalDealers}`,
          subtext: `${dealers.unassignedDealers} unassigned · ${dealers.totalDistributors} distributors`,
          tone: dealers.unassignedDealers > 0 ? 'warning' : 'neutral',
        }),
        b.add('MetricCard', {
          label: 'Enquiries',
          value: `${enquiries.new} New`,
          subtext: `${enquiries.inProgress} in progress · ${enquiries.closed} closed`,
          tone: 'info',
        }),
        b.add('MetricCard', {
          label: 'Attention Queue',
          value: attentionTotal,
          subtext: `Inventory ${attention.inventory.total}, Dealers ${attention.dealers.total}, Enquiries ${attention.enquiries.total}`,
          tone: attentionTotal > 0 ? 'danger' : 'neutral',
        }),
      ];
      const gridId = b.add('MetricGrid', { columns: 4 }, metricCards);

      const timelineId = b.add('Timeline', {
        items: activity.items.map((item) => ({
          key: item.id,
          title: words(item.event),
          subtitle: words(item.module),
          timestamp: formatDateTime(item.occurredAt),
        })),
        emptyText: 'No activity recorded in this window.',
      });

      const root = b.add(
        'CardContainer',
        {
          title: 'Executive Operational Overview',
          subtitle: `Activity window: ${formatDateTime(activity.window.from)} to ${formatDateTime(activity.window.to)}`,
          badge: `${activity.total} events`,
        },
        [gridId, timelineId]
      );
      return b.setRoot(root).build();
    }

    default: {
      const unhandled: never = response;
      return unhandled;
    }
  }
}

import { getInternalOverview } from '@trionyx/auth';
import type { SafeUser } from '@trionyx/types';

export const internalOverviewService = {
  async getOverview(user: SafeUser, organizationId?: string) {
    const raw = await getInternalOverview(user, organizationId);
    return {
      organizationId: organizationId || 'org-trionyx',
      summary: {
        activeDealers: raw.summary.activeDealers,
        lowStock: raw.summary.lowStock,
        pendingActions: raw.summary.pendingActions,
      },
      recentActivity: raw.recentActivity,
      attentionItems: raw.attentionItems,
    };
  },
};

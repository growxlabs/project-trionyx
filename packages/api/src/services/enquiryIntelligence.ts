import { ensureDatabaseReady, contactEnquiriesRepository, enquiryReadsRepository } from '@trionyx/database';

export class EnquiryReadError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export function createEnquiryIntelligenceService(reads: {
  list: typeof contactEnquiriesRepository.list;
  owners: typeof enquiryReadsRepository.owners;
  summary: typeof enquiryReadsRepository.summary;
  attention: typeof enquiryReadsRepository.attention;
  changes: typeof enquiryReadsRepository.changes;
}) {
  return {
    ...reads,
    async resolveOwner(target: { ownerId?: string; ownerName?: string }) {
      const owners = await reads.owners(target);
      if (owners.length > 1) throw new EnquiryReadError('TRIX_OWNER_AMBIGUOUS', 'Multiple internal users have that name. Supply an owner ID.');
      if (!owners.length) throw new EnquiryReadError('TRIX_OWNER_NOT_FOUND', 'No matching internal owner was found. Supply an exact name or ID.');
      return owners[0];
    },
    async detail(target: { enquiryId?: string; enquiryCode?: string }) {
      const result = await reads.list({ ...target, limit: 2 });
      if (!result.total) throw new EnquiryReadError('TRIX_ENQUIRY_NOT_FOUND', 'No matching enquiry was found. Supply its stored ID or TRX-ENQ code.');
      if (result.total > 1) throw new EnquiryReadError('TRIX_ENQUIRY_AMBIGUOUS', 'Supply a unique enquiry ID or code.');
      return result.items[0];
    },
  };
}
export const enquiryIntelligenceService = createEnquiryIntelligenceService({
  list: async query => contactEnquiriesRepository.list(query, await ensureDatabaseReady()),
  owners: async target => enquiryReadsRepository.owners(target, await ensureDatabaseReady()),
  summary: async query => enquiryReadsRepository.summary(query, await ensureDatabaseReady()),
  attention: async query => enquiryReadsRepository.attention(query, await ensureDatabaseReady()),
  changes: async query => {
    try { return await enquiryReadsRepository.changes(query, await ensureDatabaseReady()); }
    catch { throw new EnquiryReadError('TRIX_ENQUIRY_HISTORY_UNAVAILABLE', 'Enquiry audit history is unavailable. Current timestamps do not prove lifecycle changes.'); }
  },
});

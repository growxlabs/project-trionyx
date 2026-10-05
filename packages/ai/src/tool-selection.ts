export function preparationIntent(message: string) {
  if (/\b(all|every|automatically|without confirmation|skip confirmation)\b/i.test(message)) return undefined;
  if (/\b(change|assign|reassign|prepare)\b.*\bdealer\b.*\bdistributor\b/i.test(message)) return 'prepareDealerDistributorAssignment' as const;
  if (/\b(assign|prepare)\b.*\benquir(?:y|ies)\b.*\b(to|owner|user)\b/i.test(message)) return 'prepareEnquiryAssignment' as const;
  if (/\b(change|prepare)\b.*\benquiry\b.*\b(status|NEW|IN_PROGRESS|CLOSED)\b/i.test(message)) return 'prepareEnquiryStatusChange' as const;
  if (/\b(transfer|prepare)\b.*\bserials?\b.*\b(to|destination|location)\b/i.test(message)) return 'prepareInventoryTransfer' as const;
  return undefined;
}
const preparationTools = ['prepareDealerDistributorAssignment','prepareEnquiryAssignment','prepareEnquiryStatusChange','prepareInventoryTransfer'] as const;
const inventoryTools = ['lookupSerial', 'searchInventory', 'getInventorySummary', 'getRecentSerialMovements', 'getInventoryExceptions'] as const;
const networkTools = ['searchDealers', 'getDealerDetails', 'searchDistributors', 'getDistributorDetails', 'getDealerNetworkSummary', 'getDealerAssignmentHistory', 'getDealerNetworkExceptions'] as const;
const enquiryTools = ['searchEnquiries', 'getEnquiryDetails', 'getEnquirySummary', 'getEnquiryAttention', 'getRecentEnquiryChanges'] as const;
const warrantyTools = ['getWarrantyBySerial', 'searchWarranties', 'getWarrantySummary', 'getWarrantyExceptions'] as const;
const executiveTools = ['getExecutiveOverview', 'getRecentOperationalChanges'] as const;
type ToolName = typeof inventoryTools[number] | typeof networkTools[number] | typeof enquiryTools[number] | typeof warrantyTools[number] | typeof executiveTools[number] | typeof preparationTools[number];
export const TRIX_TOOL_NAMES=[...inventoryTools,...networkTools,...enquiryTools,...warrantyTools,...executiveTools,...preparationTools] as const;
/** Keep model requests small. Authorization and execution limits still apply to every tool. */
export function activeTrixTools(message: string): ToolName[] | undefined {
  const preparation = preparationIntent(message);
  if (preparation && preparationTools.includes(preparation)) return [preparation];
  const modules = [/\b(inventory|stock|serials?)\b/i, /\benquir(?:y|ies)\b/i, /\bwarrant(?:y|ies)\b/i, /\bdealers?\b/i].filter(pattern => pattern.test(message)).length;
  if (/\b(executive|operational|across\s+Trionyx)\b/i.test(message) || /what\s+(changed|happened|needs\s+(my\s+)?attention)/i.test(message) || (modules >= 2 && /\b(activity|summary|changes)\b/i.test(message))) return [...executiveTools];
  if (/\bwarrant(?:y|ies)\b/i.test(message) && /\b(voided|history|events|changes|activity)\b/i.test(message)) return ['getRecentOperationalChanges'];
  if (/\bwarrant(?:y|ies)\b/i.test(message)) return [...warrantyTools];
  // Enquiry type/owner references may mention dealers or products; those remain enquiry filters.
  if (/\benquir(?:y|ies)\b/i.test(message)) return [...enquiryTools];
  if (/\b(dealers?|distributors?|distribution|studios?)\b/i.test(message)) return [...networkTools];
  if (/\b(?:where\s+is|check|find|lookup|open)\b.*\bserial\b[\s:#]+[A-Za-z0-9][A-Za-z0-9-]{3,}\b/i.test(message)) return ['lookupSerial'];
  if (/\b(serials?|inventory|stock|products?|locations?|movements?)\b/i.test(message)) return [...inventoryTools];
  return undefined;
}

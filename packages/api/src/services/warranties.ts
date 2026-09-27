import {
  ensureDatabaseReady,
  warrantiesRepository,
  warrantyPoliciesRepository,
  serialsRepository,
  productsRepository,
  auditLogsRepository,
  dealersRepository,
} from '@trionyx/database';
import type {
  Warranty,
  WarrantyPolicy,
  WarrantyStatus,
  PublicWarrantyCheckResult,
  SafeUser,
  AuditEvent,
} from '@trionyx/types';

// In-memory sliding window rate limiter for public warranty checks (prevent serial enumeration)
const publicRateStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30; // max lookups per window
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function checkPublicRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = publicRateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    publicRateStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

export function calculateWarrantyEndDate(startDateStr: string, durationMonths: number): string {
  const [yearStr, monthStr, dayStr] = startDateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const totalMonths = month - 1 + durationMonths;
  const targetYear = year + Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  const yyyy = String(targetYear).padStart(4, '0');
  const mm = String(targetMonth).padStart(2, '0');
  const dd = String(targetDay).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const warrantiesService = {
  /**
   * Public Customer Warranty Lookup (Safe, Rate-Limited, Zero Private Data Leakage)
   */
  async checkPublicWarranty(
    serialNumber: string,
    meta?: { ipAddress?: string | null; userAgent?: string | null }
  ): Promise<PublicWarrantyCheckResult> {
    const client = await ensureDatabaseReady();
    const cleanSn = serialNumber.trim().toUpperCase();

    // 1. Find serial number in inventory
    const serial = await serialsRepository.findBySerialNumber(cleanSn, client);
    if (!serial) {
      return {
        status: 'NOT_FOUND',
        serialNumber: cleanSn,
        message: 'Please check the serial number and try again.',
      };
    }

    // 2. Check for warranty registration
    const warranty = await warrantiesRepository.findBySerialRecordId(serial.id, client);
    if (!warranty) {
      return {
        status: 'NOT_ACTIVATED',
        productName: serial.product?.name || null,
        serialNumber: cleanSn,
        message:
          'This is a valid Trionyx product serial number, but no active warranty registration was found. Please contact your Trionyx dealer.',
      };
    }

    // 3. Derived status check
    const derivedStatus = warranty.derivedStatus || 'ACTIVE';

    if (derivedStatus === 'EXPIRED') {
      return {
        status: 'EXPIRED',
        productName: warranty.productName || serial.product?.name || null,
        serialNumber: cleanSn,
        installationDate: warranty.installationDate,
        activatedAt: warranty.activatedAt,
        warrantyEndDate: warranty.warrantyEndDate,
        dealerName: warranty.dealerName || null,
      };
    }

    if (derivedStatus === 'VOID') {
      return {
        status: 'EXPIRED',
        productName: warranty.productName || serial.product?.name || null,
        serialNumber: cleanSn,
        installationDate: warranty.installationDate,
        activatedAt: warranty.activatedAt,
        warrantyEndDate: warranty.warrantyEndDate,
        dealerName: warranty.dealerName || null,
        message: 'This warranty registration is not active.',
      };
    }

    return {
      status: 'ACTIVE',
      productName: warranty.productName || serial.product?.name || null,
      serialNumber: cleanSn,
      installationDate: warranty.installationDate,
      activatedAt: warranty.activatedAt,
      warrantyEndDate: warranty.warrantyEndDate,
      dealerName: warranty.dealerName || null,
    };
  },

  /**
   * Validate serial number prior to activation (returns product and policy status)
   */
  async validateSerialForActivation(
    serialNumber: string,
    dealerId?: string
  ): Promise<{
    valid: boolean;
    serialNumber: string;
    productName: string;
    productCode: string;
    productId: string;
    policyDurationMonths: number | null;
    isPolicyConfigured: boolean;
    isAlreadyActivated: boolean;
    existingWarranty?: Warranty | null;
    error?: string;
  }> {
    const client = await ensureDatabaseReady();
    const cleanSn = serialNumber.trim().toUpperCase();

    const serial = await serialsRepository.findBySerialNumber(cleanSn, client);
    if (!serial) {
      return {
        valid: false,
        serialNumber: cleanSn,
        productName: '',
        productCode: '',
        productId: '',
        policyDurationMonths: null,
        isPolicyConfigured: false,
        isAlreadyActivated: false,
        error: 'Serial number not found in Trionyx inventory',
      };
    }

    if (serial.status === 'INACTIVE') {
      return {
        valid: false,
        serialNumber: cleanSn,
        productName: serial.product?.name || '',
        productCode: serial.product?.productCode || '',
        productId: serial.productId,
        policyDurationMonths: null,
        isPolicyConfigured: false,
        isAlreadyActivated: false,
        error: 'This serial number is marked as inactive',
      };
    }

    // Check if already activated
    const existing = await warrantiesRepository.findBySerialRecordId(serial.id, client);
    if (existing) {
      return {
        valid: false,
        serialNumber: cleanSn,
        productName: serial.product?.name || '',
        productCode: serial.product?.productCode || '',
        productId: serial.productId,
        policyDurationMonths: null,
        isPolicyConfigured: true,
        isAlreadyActivated: true,
        existingWarranty: existing,
        error: 'Warranty already activated for this serial number',
      };
    }

    // Check policy
    const policy = await warrantyPoliciesRepository.findByProductId(serial.productId, client);
    if (!policy || policy.status !== 'ACTIVE' || !policy.durationMonths) {
      return {
        valid: false,
        serialNumber: cleanSn,
        productName: serial.product?.name || '',
        productCode: serial.product?.productCode || '',
        productId: serial.productId,
        policyDurationMonths: null,
        isPolicyConfigured: false,
        isAlreadyActivated: false,
        error: 'Warranty policy not configured for this product',
      };
    }

    return {
      valid: true,
      serialNumber: cleanSn,
      productName: serial.product?.name || '',
      productCode: serial.product?.productCode || '',
      productId: serial.productId,
      policyDurationMonths: policy.durationMonths,
      isPolicyConfigured: true,
      isAlreadyActivated: false,
    };
  },

  /**
   * Activate Warranty (Used by Authorized Dealer and Internal Operations)
   */
  async activateWarranty(
    input: {
      serialNumber: string;
      installationDate: string;
      actorId: string;
      actorType: 'INTERNAL' | 'DEALER';
      dealerId?: string | null;
    },
    meta?: { ipAddress?: string | null; userAgent?: string | null }
  ): Promise<Warranty> {
    const client = await ensureDatabaseReady();
    const cleanSn = input.serialNumber.trim().toUpperCase();

    // 1. Find serial record
    const serial = await serialsRepository.findBySerialNumber(cleanSn, client);
    if (!serial) {
      const err: any = new Error(`Serial number "${cleanSn}" not found in Trionyx inventory`);
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (serial.status === 'INACTIVE') {
      const err: any = new Error(`Serial number "${cleanSn}" is marked as inactive`);
      err.code = 'INVALID_SERIAL';
      throw err;
    }

    // 2. Validate warranty does not already exist
    const existing = await warrantiesRepository.findBySerialRecordId(serial.id, client);
    if (existing) {
      const err: any = new Error('Warranty already activated for this serial number');
      err.code = 'WARRANTY_ALREADY_ACTIVATED';
      err.details = {
        serialNumber: cleanSn,
        productName: existing.productName,
        activationDate: existing.installationDate,
        warrantyEndDate: existing.warrantyEndDate,
        status: existing.status,
      };
      throw err;
    }

    // 3. Load approved Warranty Policy
    const policy = await warrantyPoliciesRepository.findByProductId(serial.productId, client);
    if (!policy || policy.status !== 'ACTIVE' || !policy.durationMonths) {
      const err: any = new Error('Warranty policy not configured for this product');
      err.code = 'POLICY_NOT_CONFIGURED';
      throw err;
    }

    // 4. Calculate server-side warranty dates
    const warrantyStartDate = input.installationDate;
    const warrantyEndDate = calculateWarrantyEndDate(warrantyStartDate, policy.durationMonths);

    // 5. Create warranty record
    const created = await warrantiesRepository.create(
      {
        serialRecordId: serial.id,
        productId: serial.productId,
        dealerId: input.dealerId || null,
        installationDate: input.installationDate,
        warrantyStartDate,
        warrantyEndDate,
        status: 'ACTIVE',
        activatedBy: input.actorId,
        activatedByType: input.actorType,
      },
      client
    );

    // 6. Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: input.actorType === 'INTERNAL' ? input.actorId : null,
        event: 'WARRANTY_ACTIVATED',
        ipAddress: meta?.ipAddress || null,
        userAgent: meta?.userAgent || null,
        metadata: {
          warrantyId: created.id,
          serialNumber: cleanSn,
          productId: serial.productId,
          productName: created.productName,
          dealerId: input.dealerId || null,
          installationDate: input.installationDate,
          warrantyStartDate,
          warrantyEndDate,
          durationMonths: policy.durationMonths,
          activatedBy: input.actorId,
          activatedByType: input.actorType,
        },
      },
      client
    );

    return created;
  },

  /**
   * Void an existing warranty (Managing Director / Admin only)
   */
  async voidWarranty(
    warrantyId: string,
    reason: string,
    user: SafeUser,
    meta?: { ipAddress?: string | null; userAgent?: string | null }
  ): Promise<Warranty> {
    const client = await ensureDatabaseReady();

    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      const err: any = new Error('Only Managing Director and Admin can void warranties');
      err.code = 'FORBIDDEN';
      throw err;
    }

    const warranty = await warrantiesRepository.findById(warrantyId, client);
    if (!warranty) {
      const err: any = new Error('Warranty record not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (warranty.status === 'VOID') {
      const err: any = new Error('Warranty is already voided');
      err.code = 'CONFLICT';
      throw err;
    }

    const voided = await warrantiesRepository.void(
      warrantyId,
      {
        voidedBy: user.id,
        voidReason: reason.trim(),
      },
      client
    );

    if (!voided) {
      throw new Error('Failed to void warranty');
    }

    // Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: user.id,
        event: 'WARRANTY_VOIDED',
        ipAddress: meta?.ipAddress || null,
        userAgent: meta?.userAgent || null,
        metadata: {
          warrantyId,
          serialNumber: warranty.serialNumber,
          productId: warranty.productId,
          reason: reason.trim(),
          voidedBy: user.id,
          voidedByName: user.name,
        },
      },
      client
    );

    return voided;
  },

  /**
   * List warranties with pagination and filtering
   */
  async listWarranties(
    filter?: {
      dealerId?: string;
      productId?: string;
      status?: WarrantyStatus | 'EXPIRED';
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ items: Warranty[]; total: number }> {
    const client = await ensureDatabaseReady();
    return warrantiesRepository.list(filter, client);
  },

  /**
   * Get single warranty detail by ID
   */
  async getWarrantyById(
    warrantyId: string,
    dealerIdConstraint?: string
  ): Promise<{ warranty: Warranty; auditLogs: any[] } | null> {
    const client = await ensureDatabaseReady();
    const warranty = await warrantiesRepository.findById(warrantyId, client);
    if (!warranty) return null;

    if (dealerIdConstraint && warranty.dealerId !== dealerIdConstraint) {
      const err: any = new Error('Access denied to this warranty record');
      err.code = 'FORBIDDEN';
      throw err;
    }

    // Fetch related audit logs
    const auditRes = await client.execute({
      sql: `
        SELECT * FROM audit_logs 
        WHERE event IN ('WARRANTY_ACTIVATED', 'WARRANTY_VOIDED')
          AND metadata LIKE ?
        ORDER BY created_at DESC
      `,
      args: [`%${warrantyId}%`],
    });

    return {
      warranty,
      auditLogs: auditRes.rows.map((r) => ({
        id: String(r.id),
        event: String(r.event),
        createdAt: String(r.created_at),
        ipAddress: r.ip_address ? String(r.ip_address) : null,
        metadata: r.metadata ? JSON.parse(String(r.metadata)) : null,
      })),
    };
  },

  /**
   * Get product warranty policy
   */
  async getWarrantyPolicy(productId: string): Promise<WarrantyPolicy | null> {
    const client = await ensureDatabaseReady();
    return warrantyPoliciesRepository.findByProductId(productId, client);
  },

  /**
   * Upsert product warranty policy (Managing Director / Admin only)
   */
  async upsertWarrantyPolicy(
    productId: string,
    durationMonths: number,
    status: 'ACTIVE' | 'INACTIVE',
    user: SafeUser,
    meta?: { ipAddress?: string | null; userAgent?: string | null }
  ): Promise<WarrantyPolicy> {
    const client = await ensureDatabaseReady();

    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      const err: any = new Error('Only Managing Director and Admin can configure warranty policies');
      err.code = 'FORBIDDEN';
      throw err;
    }

    const existing = await warrantyPoliciesRepository.findByProductId(productId, client);
    const policy = await warrantyPoliciesRepository.upsert(
      {
        productId,
        durationMonths,
        status,
      },
      client
    );

    const eventName: AuditEvent = existing ? 'WARRANTY_POLICY_UPDATED' : 'WARRANTY_POLICY_CREATED';

    await auditLogsRepository.recordEvent(
      {
        userId: user.id,
        event: eventName,
        ipAddress: meta?.ipAddress || null,
        userAgent: meta?.userAgent || null,
        metadata: {
          policyId: policy.id,
          productId,
          durationMonths,
          status,
          updatedBy: user.id,
          updatedByName: user.name,
        },
      },
      client
    );

    return policy;
  },
};

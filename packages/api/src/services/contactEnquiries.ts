import type { DatabaseClient as Client } from '@trionyx/database';
import {
  ensureDatabaseReady,
  contactEnquiriesRepository,
  enquiryNotesRepository,
  auditLogsRepository,
} from '@trionyx/database';
import type {
  ContactEnquiry,
  ContactEnquiryStatus,
  ContactEnquiryType,
  EnquiryNote,
} from '@trionyx/types';

export const contactEnquiriesService = {
  async create(
    data: {
      type: ContactEnquiryType;
      fullName: string;
      phone: string;
      email: string;
      companyName?: string | null;
      businessAddress?: string | null;
      businessType?: string | null;
      city: string;
      state: string;
      pincode: string;
      territory?: string | null;
      productId?: string | null;
      purchaseDealerDetails?: string | null;
      message: string;
    },
    meta?: { ipAddress?: string | null; userAgent?: string | null }
  ): Promise<ContactEnquiry> {
    const client = await ensureDatabaseReady();
    const created = await contactEnquiriesRepository.create(data, client);

    // Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: null,
        event: 'CONTACT_ENQUIRY_CREATED',
        ipAddress: meta?.ipAddress || null,
        userAgent: meta?.userAgent || null,
        metadata: {
          enquiryId: created.id,
          enquiryCode: created.enquiryCode,
          type: created.type,
          fullName: created.fullName,
        },
      },
      client
    );

    return created;
  },

  async getById(id: string): Promise<ContactEnquiry | null> {
    const client = await ensureDatabaseReady();
    return contactEnquiriesRepository.findById(id, client);
  },

  async list(filter?: Parameters<typeof contactEnquiriesRepository.list>[0]): Promise<{ items: ContactEnquiry[]; total: number }> {
    const client = await ensureDatabaseReady();
    return contactEnquiriesRepository.list(filter, client);
  },

  async updateStatus(
    id: string,
    status: ContactEnquiryStatus,
    operatorId: string,
    transactionClient?: Client
  ): Promise<ContactEnquiry> {
    const client = transactionClient ?? await ensureDatabaseReady();
    const existing = await contactEnquiriesRepository.findById(id, client);
    if (!existing) {
      throw new Error('Enquiry not found');
    }

    const previousStatus = existing.status;
    const updated = await contactEnquiriesRepository.updateStatus(id, status, client);
    if (!updated) {
      throw new Error('Failed to update enquiry status');
    }

    // Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: operatorId,
        event: 'CONTACT_ENQUIRY_STATUS_CHANGED',
        metadata: {
          enquiryId: id,
          enquiryCode: existing.enquiryCode,
          previousStatus,
          newStatus: status,
        },
      },
      client
    );

    return updated;
  },

  async assign(
    id: string,
    assignedTo: string | null,
    operatorId: string,
    transactionClient?: Client
  ): Promise<ContactEnquiry> {
    const client = transactionClient ?? await ensureDatabaseReady();
    const existing = await contactEnquiriesRepository.findById(id, client);
    if (!existing) {
      throw new Error('Enquiry not found');
    }

    const previousAssignedTo = existing.assignedTo;
    const updated = await contactEnquiriesRepository.assign(id, assignedTo, client);
    if (!updated) {
      throw new Error('Failed to assign enquiry');
    }

    // Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: operatorId,
        event: 'CONTACT_ENQUIRY_ASSIGNED',
        metadata: {
          enquiryId: id,
          enquiryCode: existing.enquiryCode,
          previousAssignedTo,
          newAssignedTo: assignedTo,
        },
      },
      client
    );

    return updated;
  },

  async addNote(
    enquiryId: string,
    body: string,
    operatorId: string
  ): Promise<EnquiryNote> {
    const client = await ensureDatabaseReady();
    const existing = await contactEnquiriesRepository.findById(enquiryId, client);
    if (!existing) {
      throw new Error('Enquiry not found');
    }

    const note = await enquiryNotesRepository.create(
      {
        enquiryId,
        body,
        createdBy: operatorId,
      },
      client
    );

    // Record audit event
    await auditLogsRepository.recordEvent(
      {
        userId: operatorId,
        event: 'CONTACT_ENQUIRY_NOTE_ADDED',
        metadata: {
          enquiryId,
          enquiryCode: existing.enquiryCode,
          noteId: note.id,
        },
      },
      client
    );

    return note;
  },

  async listNotes(enquiryId: string): Promise<EnquiryNote[]> {
    const client = await ensureDatabaseReady();
    return enquiryNotesRepository.listForEnquiry(enquiryId, client);
  },

  async getDuplicates(
    phone: string,
    email: string,
    excludeId?: string
  ): Promise<ContactEnquiry[]> {
    const client = await ensureDatabaseReady();
    return contactEnquiriesRepository.findDuplicates(phone, email, excludeId, client);
  },
};

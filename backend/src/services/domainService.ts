import { Domain, IDomain } from '../models/unifiedDomainModel.js';
import mongoose from 'mongoose';

/** ✅ Add a new sending domain */
export const addDomain = async (data: Partial<IDomain>): Promise<IDomain> => {
  const domain = new Domain({
    ...data,
    domain: data.domain_name || data.domain, // Ensure domain field is set
    domainType: 'verified' as const, // Set domain type
    verificationStatus: (data as any).status || 'pending', // Map status to verificationStatus
  });
  return await domain.save();
};

/** ✅ Get all domains (optionally filtered by user_id) */
export const getDomains = async (user_id?: string): Promise<IDomain[]> => {
  const filter = user_id ? { user_id: new mongoose.Types.ObjectId(user_id) } : {};
  return await Domain.find(filter).sort({ _id: 1 });
};

/** ✅ Mark domain as verified (after DNS check) */
export const markDomainVerified = async (domain_id: string): Promise<void> => {
  await Domain.findByIdAndUpdate(domain_id, {
    verified: true,
    verificationStatus: 'verified', // Use verificationStatus for unified model
    last_verified_at: new Date(),
    updatedAt: new Date(),
  });
};

/** ✅ Disable or suspend a domain */
export const disableDomain = async (domain_id: string): Promise<void> => {
  await Domain.findByIdAndUpdate(domain_id, {
    verificationStatus: 'disabled', // Use verificationStatus for unified model
    updatedAt: new Date(),
  });
};

/** ✅ Update DKIM/SPF/DMARC records */
export const updateDomainRecords = async (
  domain_id: string,
  updates: Partial<Pick<IDomain, 'dkim_public_key' | 'spf_record' | 'dmarc_record'>>
): Promise<void> => {
  const { dkim_public_key, spf_record, dmarc_record } = updates;
  await Domain.findByIdAndUpdate(domain_id, {
    ...(dkim_public_key && { dkim_public_key }),
    ...(spf_record && { spf_record }),
    ...(dmarc_record && { dmarc_record }),
    updatedAt: new Date(),
  });
};

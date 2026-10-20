import { z } from 'zod';

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().max(25).optional().default(''),
  subject: z.string().trim().max(150).optional().default('General Inquiry'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000)
});

export const privacyRequestSchema = z.object({
  type: z.string().optional(),
  requestType: z.string().optional(),
  fullName: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().optional().default(''),
  details: z.string().trim().max(1000).optional().default('')
}).transform(data => {
  const rawType = (data.type || data.requestType || 'data_access').toLowerCase();
  let normalizedType: 'data_access' | 'data_erasure' | 'consent_withdrawal' | 'data_correction' = 'data_access';
  if (rawType.includes('eras') || rawType.includes('delet')) {
    normalizedType = 'data_erasure';
  } else if (rawType.includes('correct')) {
    normalizedType = 'data_correction';
  } else if (rawType.includes('withdraw')) {
    normalizedType = 'consent_withdrawal';
  }

  return {
    type: normalizedType,
    fullName: data.fullName,
    email: data.email || '',
    phone: data.phone || '',
    details: data.details || ''
  };
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type PrivacyRequestInput = z.infer<typeof privacyRequestSchema>;

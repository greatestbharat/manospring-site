import { Inquiry, PrivacyRequest } from '../../types/index.js';
import { ContactInquiryInput, PrivacyRequestInput } from '../../validators/contact.validator.js';

export class ContactService {
  private inquiries: Inquiry[] = [];
  private privacyRequests: PrivacyRequest[] = [];

  public submitInquiry(input: ContactInquiryInput): Inquiry {
    const inquiry: Inquiry = {
      id: `TKT-${Date.now().toString().slice(-6)}`,
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      subject: input.subject || 'General Inquiry',
      message: input.message,
      submittedAt: new Date().toISOString()
    };
    this.inquiries.push(inquiry);
    return inquiry;
  }

  public submitPrivacyRequest(input: PrivacyRequestInput): PrivacyRequest {
    const request: PrivacyRequest = {
      id: `DPDPA-${Date.now().toString().slice(-6)}`,
      type: input.type,
      fullName: input.fullName,
      email: input.email || '',
      phone: input.phone || '',
      details: input.details || '',
      status: 'received',
      receivedAt: new Date().toISOString()
    };
    this.privacyRequests.push(request);
    return request;
  }
}

export const contactService = new ContactService();

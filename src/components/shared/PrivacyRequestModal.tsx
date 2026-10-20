import React, { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { apiFetch } from '../../services/api';

interface PrivacyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ticketId: string) => void;
}

export const PrivacyRequestModal: React.FC<PrivacyRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [type, setType] = useState('data_erasure');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch<{ ok: boolean; ticketId: string }>('/privacy/request', {
        method: 'POST',
        body: JSON.stringify({ type, fullName, email, details })
      });
      if (res.ok && res.ticketId) {
        onSuccess(res.ticketId);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Data Privacy Request (DPDPA 2023)">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-600">
          Exercise your statutory rights under the Digital Personal Data Protection Act 2023. Our Data Protection Officer processes requests within 72 business hours.
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Request Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-paper-cream border border-sage-200 rounded-xl text-sm text-slate-900 outline-none focus:bg-white focus:border-brand-600"
          >
            <option value="data_erasure">Complete Erasure of Personal Records</option>
            <option value="data_access">Summary of Processed Health Records</option>
            <option value="consent_withdrawal">Withdrawal of Telemedicine Consent</option>
          </select>
        </div>

        <Input
          label="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />

        <Input
          label="Email or Mobile Number"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Registered contact info"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Additional Context (Optional)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="Include any appointment references or details..."
            className="w-full px-3.5 py-2.5 bg-paper-cream border border-sage-200 rounded-xl text-sm text-slate-900 outline-none focus:bg-white focus:border-brand-600"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" size="sm" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request to DPO'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

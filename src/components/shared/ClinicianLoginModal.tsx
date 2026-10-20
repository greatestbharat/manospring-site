import React, { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { apiFetch } from '../../services/api';

interface ClinicianLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const ClinicianLoginModal: React.FC<ClinicianLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('doctor@manospring.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<{ ok: boolean; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role: 'clinician' })
      });

      if (data.ok && data.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Clinician Workspace Access" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-600">
          For registered psychiatrists and clinical psychologists to review appointment schedules and patient intake summaries.
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <Input
          label="Clinician Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-[11px] text-slate-500 bg-sage-50 p-2.5 rounded-lg border border-sage-100">
          Demo Credentials: <code>doctor@manospring.com</code> / <code>demo123</code>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" size="sm" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Workspace →'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

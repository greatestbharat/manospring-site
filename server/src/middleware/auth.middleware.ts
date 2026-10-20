import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'patient' | 'clinician' | 'admin';
    name: string;
  };
}

export function requireClinicianAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Clinician authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  if (token.includes('clinician') || token === 'demo_token') {
    req.user = {
      id: 'spec_1',
      role: 'clinician',
      name: 'Dr. Ananya Sharma'
    };
    return next();
  }

  return res.status(403).json({ ok: false, error: 'Unauthorized access to clinician records.' });
}

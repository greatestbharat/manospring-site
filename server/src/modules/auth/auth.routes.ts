import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password, role, phone, name } = req.body;

  const isClinician = role === 'clinician' || 
    Boolean(email && (email.includes('doctor') || email.includes('sharma') || email.endsWith('@manospring.com')));

  if (isClinician) {
    return res.json({
      ok: true,
      token: 'token_clinician_demo_78421',
      user: {
        id: 'spec_1',
        name: 'Dr. Ananya Sharma',
        role: 'clinician',
        title: 'Consultant Psychiatrist',
        token: 'token_clinician_demo_78421'
      }
    });
  }

  // Patient Quick Login
  const token = 'token_patient_demo_' + Date.now();
  return res.json({
    ok: true,
    token,
    user: {
      id: 'patient_' + Date.now().toString().slice(-6),
      name: name || 'Patient User',
      phone: phone || '+91 98765 43210',
      role: 'patient',
      token
    }
  });
});

export default router;

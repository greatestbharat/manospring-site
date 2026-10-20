import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { GroqApiError } from '../services/groq.service.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: err.issues.map(i => i.message).join(', '),
      retryable: false
    });
  }

  if (err instanceof GroqApiError) {
    return res.status(err.status).json({
      ok: false,
      error: err.message,
      code: err.code,
      retryable: err.retryable
    });
  }

  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred. Please try again.';

  return res.status(status).json({
    ok: false,
    error: message,
    retryable: status >= 500
  });
}

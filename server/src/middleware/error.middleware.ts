import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: err.issues.map(i => i.message).join(', ')
    });
  }

  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred. Please try again.';

  return res.status(status).json({
    ok: false,
    error: message
  });
}

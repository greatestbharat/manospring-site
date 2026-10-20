import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']).default('user'),
  content: z.string().trim().min(1, 'Message cannot be empty').max(3000, 'Message exceeds 3000 characters')
});

export const chatRequestSchema = z.union([
  z.object({
    messages: z.array(chatMessageSchema).min(1, 'At least one message is required').max(30)
  }),
  z.object({
    message: z.string().trim().min(1, 'Message cannot be empty'),
    history: z.array(chatMessageSchema).optional().default([])
  }).transform(data => ({
    messages: [...data.history, { role: 'user' as const, content: data.message }]
  }))
]);

export type ChatRequest = z.infer<typeof chatRequestSchema>;

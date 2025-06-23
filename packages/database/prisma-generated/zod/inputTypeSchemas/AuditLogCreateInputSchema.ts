import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const AuditLogCreateInputSchema: z.ZodType<Prisma.AuditLogCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    type: z.string(),
    action: z.string(),
    userId: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    ipAddress: z.string().optional().nullable(),
    userAgent: z.string().optional().nullable(),
    metadata: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    success: z.boolean(),
    errorMessage: z.string().optional().nullable(),
    timestamp: z.coerce.date().optional(),
  })
  .strict();

export default AuditLogCreateInputSchema;

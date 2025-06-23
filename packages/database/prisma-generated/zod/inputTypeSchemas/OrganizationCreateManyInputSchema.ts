import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const OrganizationCreateManyInputSchema: z.ZodType<Prisma.OrganizationCreateManyInput> = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logo: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    metadata: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional().nullable(),
  })
  .strict();

export default OrganizationCreateManyInputSchema;

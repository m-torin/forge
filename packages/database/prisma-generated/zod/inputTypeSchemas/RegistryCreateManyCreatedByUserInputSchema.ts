import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';

export const RegistryCreateManyCreatedByUserInputSchema: z.ZodType<Prisma.RegistryCreateManyCreatedByUserInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      deletedById: z.string().optional().nullable(),
      title: z.string(),
      description: z.string().optional().nullable(),
      type: z.lazy(() => RegistryTypeSchema).optional(),
      isPublic: z.boolean().optional(),
      eventDate: z.coerce.date().optional().nullable(),
    })
    .strict();

export default RegistryCreateManyCreatedByUserInputSchema;

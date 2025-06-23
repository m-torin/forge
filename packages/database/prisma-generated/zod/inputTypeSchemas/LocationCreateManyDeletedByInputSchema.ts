import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationTypeSchema } from './LocationTypeSchema';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const LocationCreateManyDeletedByInputSchema: z.ZodType<Prisma.LocationCreateManyDeletedByInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      locationType: z.lazy(() => LocationTypeSchema).optional(),
      lodgingType: z
        .lazy(() => LodgingTypeSchema)
        .optional()
        .nullable(),
      isFictional: z.boolean().optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
    })
    .strict();

export default LocationCreateManyDeletedByInputSchema;

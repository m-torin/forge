import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const StoryCreateManyInputSchema: z.ZodType<Prisma.StoryCreateManyInput> = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string(),
    slug: z.string(),
    seriesId: z.string().optional().nullable(),
    fandomId: z.string(),
    displayOrder: z.number().int().optional(),
    isFictional: z.boolean().optional(),
    copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    deletedById: z.string().optional().nullable(),
  })
  .strict();

export default StoryCreateManyInputSchema;

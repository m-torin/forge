import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const PdpJoinCreateManyProductInputSchema: z.ZodType<Prisma.PdpJoinCreateManyProductInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      brandId: z.string(),
      canonicalUrl: z.string(),
      iframeUrl: z.string().optional().nullable(),
      tempMediaUrls: z.string().optional().nullable(),
      lastScanned: z.coerce.date().optional().nullable(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
    })
    .strict();

export default PdpJoinCreateManyProductInputSchema;

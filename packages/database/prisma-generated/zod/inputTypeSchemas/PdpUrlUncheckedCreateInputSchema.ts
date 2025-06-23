import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const PdpUrlUncheckedCreateInputSchema: z.ZodType<Prisma.PdpUrlUncheckedCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string(),
    url: z.string(),
    pdpJoinId: z.string(),
    urlType: z.lazy(() => PdpUrlTypeSchema).optional(),
    isActive: z.boolean().optional(),
    copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
    createdAt: z.coerce.date().optional(),
  })
  .strict();

export default PdpUrlUncheckedCreateInputSchema;

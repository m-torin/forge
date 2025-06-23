import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { PdpJoinCreateNestedOneWithoutUrlsInputSchema } from './PdpJoinCreateNestedOneWithoutUrlsInputSchema';

export const PdpUrlCreateInputSchema: z.ZodType<Prisma.PdpUrlCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string(),
    url: z.string(),
    urlType: z.lazy(() => PdpUrlTypeSchema).optional(),
    isActive: z.boolean().optional(),
    copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
    createdAt: z.coerce.date().optional(),
    pdpJoin: z.lazy(() => PdpJoinCreateNestedOneWithoutUrlsInputSchema),
  })
  .strict();

export default PdpUrlCreateInputSchema;

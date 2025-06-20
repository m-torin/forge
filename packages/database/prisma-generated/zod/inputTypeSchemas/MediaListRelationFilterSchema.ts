import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereInputSchema } from './MediaWhereInputSchema';

export const MediaListRelationFilterSchema: z.ZodType<Prisma.MediaListRelationFilter> = z.object({
  every: z.lazy(() => MediaWhereInputSchema).optional(),
  some: z.lazy(() => MediaWhereInputSchema).optional(),
  none: z.lazy(() => MediaWhereInputSchema).optional()
}).strict();

export default MediaListRelationFilterSchema;

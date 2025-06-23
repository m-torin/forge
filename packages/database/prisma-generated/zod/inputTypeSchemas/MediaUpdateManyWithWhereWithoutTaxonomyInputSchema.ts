import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutTaxonomyInputSchema } from './MediaUncheckedUpdateManyWithoutTaxonomyInputSchema';

export const MediaUpdateManyWithWhereWithoutTaxonomyInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutTaxonomyInput> =
  z
    .object({
      where: z.lazy(() => MediaScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateManyMutationInputSchema),
        z.lazy(() => MediaUncheckedUpdateManyWithoutTaxonomyInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateManyWithWhereWithoutTaxonomyInputSchema;

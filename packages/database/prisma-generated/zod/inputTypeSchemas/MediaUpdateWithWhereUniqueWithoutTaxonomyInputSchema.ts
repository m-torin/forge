import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutTaxonomyInputSchema } from './MediaUpdateWithoutTaxonomyInputSchema';
import { MediaUncheckedUpdateWithoutTaxonomyInputSchema } from './MediaUncheckedUpdateWithoutTaxonomyInputSchema';

export const MediaUpdateWithWhereUniqueWithoutTaxonomyInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutTaxonomyInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateWithoutTaxonomyInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutTaxonomyInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateWithWhereUniqueWithoutTaxonomyInputSchema;

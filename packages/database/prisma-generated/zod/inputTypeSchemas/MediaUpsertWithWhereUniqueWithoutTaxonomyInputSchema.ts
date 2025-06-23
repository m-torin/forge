import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutTaxonomyInputSchema } from './MediaUpdateWithoutTaxonomyInputSchema';
import { MediaUncheckedUpdateWithoutTaxonomyInputSchema } from './MediaUncheckedUpdateWithoutTaxonomyInputSchema';
import { MediaCreateWithoutTaxonomyInputSchema } from './MediaCreateWithoutTaxonomyInputSchema';
import { MediaUncheckedCreateWithoutTaxonomyInputSchema } from './MediaUncheckedCreateWithoutTaxonomyInputSchema';

export const MediaUpsertWithWhereUniqueWithoutTaxonomyInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutTaxonomyInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MediaUpdateWithoutTaxonomyInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutTaxonomyInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MediaCreateWithoutTaxonomyInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutTaxonomyInputSchema),
      ]),
    })
    .strict();

export default MediaUpsertWithWhereUniqueWithoutTaxonomyInputSchema;

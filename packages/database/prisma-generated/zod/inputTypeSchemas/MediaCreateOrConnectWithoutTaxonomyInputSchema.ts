import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutTaxonomyInputSchema } from './MediaCreateWithoutTaxonomyInputSchema';
import { MediaUncheckedCreateWithoutTaxonomyInputSchema } from './MediaUncheckedCreateWithoutTaxonomyInputSchema';

export const MediaCreateOrConnectWithoutTaxonomyInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutTaxonomyInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => MediaCreateWithoutTaxonomyInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutTaxonomyInputSchema),
      ]),
    })
    .strict();

export default MediaCreateOrConnectWithoutTaxonomyInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema;

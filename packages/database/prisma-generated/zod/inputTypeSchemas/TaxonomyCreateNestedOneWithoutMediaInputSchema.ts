import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutMediaInputSchema } from './TaxonomyCreateWithoutMediaInputSchema';
import { TaxonomyUncheckedCreateWithoutMediaInputSchema } from './TaxonomyUncheckedCreateWithoutMediaInputSchema';
import { TaxonomyCreateOrConnectWithoutMediaInputSchema } from './TaxonomyCreateOrConnectWithoutMediaInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';

export const TaxonomyCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.TaxonomyCreateNestedOneWithoutMediaInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TaxonomyCreateWithoutMediaInputSchema),
          z.lazy(() => TaxonomyUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => TaxonomyCreateOrConnectWithoutMediaInputSchema).optional(),
      connect: z.lazy(() => TaxonomyWhereUniqueInputSchema).optional(),
    })
    .strict();

export default TaxonomyCreateNestedOneWithoutMediaInputSchema;

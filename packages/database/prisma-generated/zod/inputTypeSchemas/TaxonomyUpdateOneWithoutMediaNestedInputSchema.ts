import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutMediaInputSchema } from './TaxonomyCreateWithoutMediaInputSchema';
import { TaxonomyUncheckedCreateWithoutMediaInputSchema } from './TaxonomyUncheckedCreateWithoutMediaInputSchema';
import { TaxonomyCreateOrConnectWithoutMediaInputSchema } from './TaxonomyCreateOrConnectWithoutMediaInputSchema';
import { TaxonomyUpsertWithoutMediaInputSchema } from './TaxonomyUpsertWithoutMediaInputSchema';
import { TaxonomyWhereInputSchema } from './TaxonomyWhereInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateToOneWithWhereWithoutMediaInputSchema } from './TaxonomyUpdateToOneWithWhereWithoutMediaInputSchema';
import { TaxonomyUpdateWithoutMediaInputSchema } from './TaxonomyUpdateWithoutMediaInputSchema';
import { TaxonomyUncheckedUpdateWithoutMediaInputSchema } from './TaxonomyUncheckedUpdateWithoutMediaInputSchema';

export const TaxonomyUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.TaxonomyUpdateOneWithoutMediaNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TaxonomyCreateWithoutMediaInputSchema),
          z.lazy(() => TaxonomyUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => TaxonomyCreateOrConnectWithoutMediaInputSchema).optional(),
      upsert: z.lazy(() => TaxonomyUpsertWithoutMediaInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => TaxonomyWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => TaxonomyWhereInputSchema)]).optional(),
      connect: z.lazy(() => TaxonomyWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => TaxonomyUpdateToOneWithWhereWithoutMediaInputSchema),
          z.lazy(() => TaxonomyUpdateWithoutMediaInputSchema),
          z.lazy(() => TaxonomyUncheckedUpdateWithoutMediaInputSchema),
        ])
        .optional(),
    })
    .strict();

export default TaxonomyUpdateOneWithoutMediaNestedInputSchema;

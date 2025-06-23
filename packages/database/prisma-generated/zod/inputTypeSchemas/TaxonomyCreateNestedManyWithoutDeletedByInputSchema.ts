import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutDeletedByInputSchema } from './TaxonomyCreateWithoutDeletedByInputSchema';
import { TaxonomyUncheckedCreateWithoutDeletedByInputSchema } from './TaxonomyUncheckedCreateWithoutDeletedByInputSchema';
import { TaxonomyCreateOrConnectWithoutDeletedByInputSchema } from './TaxonomyCreateOrConnectWithoutDeletedByInputSchema';
import { TaxonomyCreateManyDeletedByInputEnvelopeSchema } from './TaxonomyCreateManyDeletedByInputEnvelopeSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';

export const TaxonomyCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.TaxonomyCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TaxonomyCreateWithoutDeletedByInputSchema),
          z.lazy(() => TaxonomyCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => TaxonomyUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => TaxonomyUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => TaxonomyCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => TaxonomyCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => TaxonomyCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => TaxonomyWhereUniqueInputSchema),
          z.lazy(() => TaxonomyWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default TaxonomyCreateNestedManyWithoutDeletedByInputSchema;

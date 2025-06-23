import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutFandomInputSchema } from './SeriesCreateWithoutFandomInputSchema';
import { SeriesUncheckedCreateWithoutFandomInputSchema } from './SeriesUncheckedCreateWithoutFandomInputSchema';
import { SeriesCreateOrConnectWithoutFandomInputSchema } from './SeriesCreateOrConnectWithoutFandomInputSchema';
import { SeriesCreateManyFandomInputEnvelopeSchema } from './SeriesCreateManyFandomInputEnvelopeSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';

export const SeriesUncheckedCreateNestedManyWithoutFandomInputSchema: z.ZodType<Prisma.SeriesUncheckedCreateNestedManyWithoutFandomInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => SeriesCreateWithoutFandomInputSchema),
          z.lazy(() => SeriesCreateWithoutFandomInputSchema).array(),
          z.lazy(() => SeriesUncheckedCreateWithoutFandomInputSchema),
          z.lazy(() => SeriesUncheckedCreateWithoutFandomInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => SeriesCreateOrConnectWithoutFandomInputSchema),
          z.lazy(() => SeriesCreateOrConnectWithoutFandomInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => SeriesCreateManyFandomInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => SeriesWhereUniqueInputSchema),
          z.lazy(() => SeriesWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default SeriesUncheckedCreateNestedManyWithoutFandomInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandCreateWithoutJrFindReplaceRejectsInputSchema';
import { BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandCreateNestedManyWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.BrandCreateNestedManyWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => BrandCreateWithoutJrFindReplaceRejectsInputSchema).array(),
          z.lazy(() => BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default BrandCreateNestedManyWithoutJrFindReplaceRejectsInputSchema;

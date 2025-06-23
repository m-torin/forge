import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutJollyRogerInputSchema } from './BrandCreateWithoutJollyRogerInputSchema';
import { BrandUncheckedCreateWithoutJollyRogerInputSchema } from './BrandUncheckedCreateWithoutJollyRogerInputSchema';
import { BrandCreateOrConnectWithoutJollyRogerInputSchema } from './BrandCreateOrConnectWithoutJollyRogerInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandCreateNestedOneWithoutJollyRogerInputSchema: z.ZodType<Prisma.BrandCreateNestedOneWithoutJollyRogerInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutJollyRogerInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutJollyRogerInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutJollyRogerInputSchema).optional(),
      connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
    })
    .strict();

export default BrandCreateNestedOneWithoutJollyRogerInputSchema;

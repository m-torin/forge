import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutMediaInputSchema } from './BrandCreateWithoutMediaInputSchema';
import { BrandUncheckedCreateWithoutMediaInputSchema } from './BrandUncheckedCreateWithoutMediaInputSchema';

export const BrandCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => BrandCreateWithoutMediaInputSchema),
        z.lazy(() => BrandUncheckedCreateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default BrandCreateOrConnectWithoutMediaInputSchema;

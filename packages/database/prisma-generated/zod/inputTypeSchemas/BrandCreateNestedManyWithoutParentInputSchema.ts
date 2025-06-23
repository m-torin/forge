import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutParentInputSchema } from './BrandCreateWithoutParentInputSchema';
import { BrandUncheckedCreateWithoutParentInputSchema } from './BrandUncheckedCreateWithoutParentInputSchema';
import { BrandCreateOrConnectWithoutParentInputSchema } from './BrandCreateOrConnectWithoutParentInputSchema';
import { BrandCreateManyParentInputEnvelopeSchema } from './BrandCreateManyParentInputEnvelopeSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.BrandCreateNestedManyWithoutParentInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutParentInputSchema),
          z.lazy(() => BrandCreateWithoutParentInputSchema).array(),
          z.lazy(() => BrandUncheckedCreateWithoutParentInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutParentInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BrandCreateOrConnectWithoutParentInputSchema),
          z.lazy(() => BrandCreateOrConnectWithoutParentInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => BrandCreateManyParentInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default BrandCreateNestedManyWithoutParentInputSchema;

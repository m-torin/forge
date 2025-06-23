import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutUserInputSchema } from './OrderCreateWithoutUserInputSchema';
import { OrderUncheckedCreateWithoutUserInputSchema } from './OrderUncheckedCreateWithoutUserInputSchema';
import { OrderCreateOrConnectWithoutUserInputSchema } from './OrderCreateOrConnectWithoutUserInputSchema';
import { OrderCreateManyUserInputEnvelopeSchema } from './OrderCreateManyUserInputEnvelopeSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';

export const OrderUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.OrderUncheckedCreateNestedManyWithoutUserInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderCreateWithoutUserInputSchema),
          z.lazy(() => OrderCreateWithoutUserInputSchema).array(),
          z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema),
          z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema),
          z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => OrderWhereUniqueInputSchema),
          z.lazy(() => OrderWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default OrderUncheckedCreateNestedManyWithoutUserInputSchema;

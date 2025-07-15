import { z } from 'zod';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceCreateWithoutUserInputObjectSchema } from './InstanceCreateWithoutUserInput.schema';
import { InstanceUncheckedCreateWithoutUserInputObjectSchema } from './InstanceUncheckedCreateWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => InstanceCreateWithoutUserInputObjectSchema),
      z.lazy(() => InstanceUncheckedCreateWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceCreateOrConnectWithoutUserInputObjectSchema = Schema;

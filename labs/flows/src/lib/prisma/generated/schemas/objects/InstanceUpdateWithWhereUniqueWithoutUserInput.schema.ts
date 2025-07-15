import { z } from 'zod';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceUpdateWithoutUserInputObjectSchema } from './InstanceUpdateWithoutUserInput.schema';
import { InstanceUncheckedUpdateWithoutUserInputObjectSchema } from './InstanceUncheckedUpdateWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => InstanceUpdateWithoutUserInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceUpdateWithWhereUniqueWithoutUserInputObjectSchema = Schema;

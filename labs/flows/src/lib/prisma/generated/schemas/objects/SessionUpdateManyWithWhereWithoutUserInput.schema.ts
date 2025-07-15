import { z } from 'zod';
import { SessionScalarWhereInputObjectSchema } from './SessionScalarWhereInput.schema';
import { SessionUpdateManyMutationInputObjectSchema } from './SessionUpdateManyMutationInput.schema';
import { SessionUncheckedUpdateManyWithoutUserInputObjectSchema } from './SessionUncheckedUpdateManyWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => SessionScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => SessionUpdateManyMutationInputObjectSchema),
      z.lazy(() => SessionUncheckedUpdateManyWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const SessionUpdateManyWithWhereWithoutUserInputObjectSchema = Schema;

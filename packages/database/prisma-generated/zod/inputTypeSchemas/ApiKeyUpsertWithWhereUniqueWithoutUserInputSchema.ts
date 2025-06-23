import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyWhereUniqueInputSchema } from './ApiKeyWhereUniqueInputSchema';
import { ApiKeyUpdateWithoutUserInputSchema } from './ApiKeyUpdateWithoutUserInputSchema';
import { ApiKeyUncheckedUpdateWithoutUserInputSchema } from './ApiKeyUncheckedUpdateWithoutUserInputSchema';
import { ApiKeyCreateWithoutUserInputSchema } from './ApiKeyCreateWithoutUserInputSchema';
import { ApiKeyUncheckedCreateWithoutUserInputSchema } from './ApiKeyUncheckedCreateWithoutUserInputSchema';

export const ApiKeyUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ApiKeyUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => ApiKeyWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ApiKeyUpdateWithoutUserInputSchema),
        z.lazy(() => ApiKeyUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ApiKeyCreateWithoutUserInputSchema),
        z.lazy(() => ApiKeyUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default ApiKeyUpsertWithWhereUniqueWithoutUserInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorCreateWithoutUserInputSchema } from './TwoFactorCreateWithoutUserInputSchema';
import { TwoFactorUncheckedCreateWithoutUserInputSchema } from './TwoFactorUncheckedCreateWithoutUserInputSchema';
import { TwoFactorCreateOrConnectWithoutUserInputSchema } from './TwoFactorCreateOrConnectWithoutUserInputSchema';
import { TwoFactorUpsertWithoutUserInputSchema } from './TwoFactorUpsertWithoutUserInputSchema';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';
import { TwoFactorWhereUniqueInputSchema } from './TwoFactorWhereUniqueInputSchema';
import { TwoFactorUpdateToOneWithWhereWithoutUserInputSchema } from './TwoFactorUpdateToOneWithWhereWithoutUserInputSchema';
import { TwoFactorUpdateWithoutUserInputSchema } from './TwoFactorUpdateWithoutUserInputSchema';
import { TwoFactorUncheckedUpdateWithoutUserInputSchema } from './TwoFactorUncheckedUpdateWithoutUserInputSchema';

export const TwoFactorUncheckedUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.TwoFactorUncheckedUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => TwoFactorCreateWithoutUserInputSchema),z.lazy(() => TwoFactorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TwoFactorCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => TwoFactorUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => TwoFactorWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => TwoFactorWhereInputSchema) ]).optional(),
  connect: z.lazy(() => TwoFactorWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TwoFactorUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => TwoFactorUpdateWithoutUserInputSchema),z.lazy(() => TwoFactorUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export default TwoFactorUncheckedUpdateOneWithoutUserNestedInputSchema;

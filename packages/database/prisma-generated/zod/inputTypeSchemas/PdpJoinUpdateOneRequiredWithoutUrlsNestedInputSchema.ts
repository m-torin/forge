import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutUrlsInputSchema } from './PdpJoinCreateWithoutUrlsInputSchema';
import { PdpJoinUncheckedCreateWithoutUrlsInputSchema } from './PdpJoinUncheckedCreateWithoutUrlsInputSchema';
import { PdpJoinCreateOrConnectWithoutUrlsInputSchema } from './PdpJoinCreateOrConnectWithoutUrlsInputSchema';
import { PdpJoinUpsertWithoutUrlsInputSchema } from './PdpJoinUpsertWithoutUrlsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateToOneWithWhereWithoutUrlsInputSchema } from './PdpJoinUpdateToOneWithWhereWithoutUrlsInputSchema';
import { PdpJoinUpdateWithoutUrlsInputSchema } from './PdpJoinUpdateWithoutUrlsInputSchema';
import { PdpJoinUncheckedUpdateWithoutUrlsInputSchema } from './PdpJoinUncheckedUpdateWithoutUrlsInputSchema';

export const PdpJoinUpdateOneRequiredWithoutUrlsNestedInputSchema: z.ZodType<Prisma.PdpJoinUpdateOneRequiredWithoutUrlsNestedInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutUrlsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutUrlsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PdpJoinCreateOrConnectWithoutUrlsInputSchema).optional(),
  upsert: z.lazy(() => PdpJoinUpsertWithoutUrlsInputSchema).optional(),
  connect: z.lazy(() => PdpJoinWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PdpJoinUpdateToOneWithWhereWithoutUrlsInputSchema),z.lazy(() => PdpJoinUpdateWithoutUrlsInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutUrlsInputSchema) ]).optional(),
}).strict();

export default PdpJoinUpdateOneRequiredWithoutUrlsNestedInputSchema;

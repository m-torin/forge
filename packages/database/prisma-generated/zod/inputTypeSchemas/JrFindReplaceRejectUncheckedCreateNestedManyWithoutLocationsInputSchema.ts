import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectCreateWithoutLocationsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectUncheckedCreateNestedManyWithoutLocationsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedCreateNestedManyWithoutLocationsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateWithoutLocationsInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateWithoutLocationsInputSchema).array(),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default JrFindReplaceRejectUncheckedCreateNestedManyWithoutLocationsInputSchema;

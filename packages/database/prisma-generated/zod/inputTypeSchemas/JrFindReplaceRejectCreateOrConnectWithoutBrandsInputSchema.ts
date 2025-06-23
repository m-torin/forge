import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectCreateWithoutBrandsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutBrandsInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => JrFindReplaceRejectCreateWithoutBrandsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectCreateOrConnectWithoutBrandsInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutDeletedByInputSchema } from './StoryCreateWithoutDeletedByInputSchema';
import { StoryUncheckedCreateWithoutDeletedByInputSchema } from './StoryUncheckedCreateWithoutDeletedByInputSchema';
import { StoryCreateOrConnectWithoutDeletedByInputSchema } from './StoryCreateOrConnectWithoutDeletedByInputSchema';
import { StoryCreateManyDeletedByInputEnvelopeSchema } from './StoryCreateManyDeletedByInputEnvelopeSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';

export const StoryUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.StoryUncheckedCreateNestedManyWithoutDeletedByInput> = z.object({
  create: z.union([ z.lazy(() => StoryCreateWithoutDeletedByInputSchema),z.lazy(() => StoryCreateWithoutDeletedByInputSchema).array(),z.lazy(() => StoryUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => StoryUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => StoryCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => StoryCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => StoryCreateManyDeletedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => StoryWhereUniqueInputSchema),z.lazy(() => StoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default StoryUncheckedCreateNestedManyWithoutDeletedByInputSchema;

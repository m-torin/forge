import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutSeriesInputSchema } from './StoryCreateWithoutSeriesInputSchema';
import { StoryUncheckedCreateWithoutSeriesInputSchema } from './StoryUncheckedCreateWithoutSeriesInputSchema';
import { StoryCreateOrConnectWithoutSeriesInputSchema } from './StoryCreateOrConnectWithoutSeriesInputSchema';
import { StoryCreateManySeriesInputEnvelopeSchema } from './StoryCreateManySeriesInputEnvelopeSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';

export const StoryCreateNestedManyWithoutSeriesInputSchema: z.ZodType<Prisma.StoryCreateNestedManyWithoutSeriesInput> = z.object({
  create: z.union([ z.lazy(() => StoryCreateWithoutSeriesInputSchema),z.lazy(() => StoryCreateWithoutSeriesInputSchema).array(),z.lazy(() => StoryUncheckedCreateWithoutSeriesInputSchema),z.lazy(() => StoryUncheckedCreateWithoutSeriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => StoryCreateOrConnectWithoutSeriesInputSchema),z.lazy(() => StoryCreateOrConnectWithoutSeriesInputSchema).array() ]).optional(),
  createMany: z.lazy(() => StoryCreateManySeriesInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => StoryWhereUniqueInputSchema),z.lazy(() => StoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default StoryCreateNestedManyWithoutSeriesInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';

export const TaxonomyCreateNestedManyWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.TaxonomyCreateNestedManyWithoutJrFindReplaceRejectsInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyCreateNestedManyWithoutJrFindReplaceRejectsInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleCreateWithoutUserInputSchema } from './ArticleCreateWithoutUserInputSchema';
import { ArticleUncheckedCreateWithoutUserInputSchema } from './ArticleUncheckedCreateWithoutUserInputSchema';
import { ArticleCreateOrConnectWithoutUserInputSchema } from './ArticleCreateOrConnectWithoutUserInputSchema';
import { ArticleCreateManyUserInputEnvelopeSchema } from './ArticleCreateManyUserInputEnvelopeSchema';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';

export const ArticleUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ArticleUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ArticleCreateWithoutUserInputSchema),z.lazy(() => ArticleCreateWithoutUserInputSchema).array(),z.lazy(() => ArticleUncheckedCreateWithoutUserInputSchema),z.lazy(() => ArticleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ArticleCreateOrConnectWithoutUserInputSchema),z.lazy(() => ArticleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ArticleCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ArticleWhereUniqueInputSchema),z.lazy(() => ArticleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ArticleUncheckedCreateNestedManyWithoutUserInputSchema;

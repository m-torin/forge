import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { SeriesCreateNestedManyWithoutFandomInputSchema } from './SeriesCreateNestedManyWithoutFandomInputSchema';
import { ProductCreateNestedManyWithoutFandomsInputSchema } from './ProductCreateNestedManyWithoutFandomsInputSchema';
import { LocationCreateNestedManyWithoutFandomsInputSchema } from './LocationCreateNestedManyWithoutFandomsInputSchema';
import { JrFindReplaceRejectCreateNestedManyWithoutFandomsInputSchema } from './JrFindReplaceRejectCreateNestedManyWithoutFandomsInputSchema';
import { UserCreateNestedOneWithoutDeletedFandomsInputSchema } from './UserCreateNestedOneWithoutDeletedFandomsInputSchema';

export const FandomCreateWithoutStoriesInputSchema: z.ZodType<Prisma.FandomCreateWithoutStoriesInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      isFictional: z.boolean().optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      series: z.lazy(() => SeriesCreateNestedManyWithoutFandomInputSchema).optional(),
      products: z.lazy(() => ProductCreateNestedManyWithoutFandomsInputSchema).optional(),
      locations: z.lazy(() => LocationCreateNestedManyWithoutFandomsInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectCreateNestedManyWithoutFandomsInputSchema)
        .optional(),
      deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedFandomsInputSchema).optional(),
    })
    .strict();

export default FandomCreateWithoutStoriesInputSchema;

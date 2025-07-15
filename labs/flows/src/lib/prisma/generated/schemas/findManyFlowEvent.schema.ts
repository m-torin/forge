import { z } from 'zod';
import { FlowEventSelectObjectSchema } from './objects/FlowEventSelect.schema';
import { FlowEventIncludeObjectSchema } from './objects/FlowEventInclude.schema';
import { FlowEventOrderByWithRelationInputObjectSchema } from './objects/FlowEventOrderByWithRelationInput.schema';
import { FlowEventWhereInputObjectSchema } from './objects/FlowEventWhereInput.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './objects/FlowEventWhereUniqueInput.schema';
import { FlowEventScalarFieldEnumSchema } from './enums/FlowEventScalarFieldEnum.schema';

export const FlowEventFindManySchema = z.object({
  select: z.lazy(() => FlowEventSelectObjectSchema.optional()),
  include: z.lazy(() => FlowEventIncludeObjectSchema.optional()),
  orderBy: z
    .union([
      FlowEventOrderByWithRelationInputObjectSchema,
      FlowEventOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowEventWhereInputObjectSchema.optional(),
  cursor: FlowEventWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(FlowEventScalarFieldEnumSchema).optional(),
});

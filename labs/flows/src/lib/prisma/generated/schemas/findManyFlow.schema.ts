import { z } from 'zod';
import { FlowSelectObjectSchema } from './objects/FlowSelect.schema';
import { FlowIncludeObjectSchema } from './objects/FlowInclude.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './objects/FlowOrderByWithRelationInput.schema';
import { FlowWhereInputObjectSchema } from './objects/FlowWhereInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './objects/FlowWhereUniqueInput.schema';
import { FlowScalarFieldEnumSchema } from './enums/FlowScalarFieldEnum.schema';

export const FlowFindManySchema = z.object({
  select: z.lazy(() => FlowSelectObjectSchema.optional()),
  include: z.lazy(() => FlowIncludeObjectSchema.optional()),
  orderBy: z
    .union([
      FlowOrderByWithRelationInputObjectSchema,
      FlowOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowWhereInputObjectSchema.optional(),
  cursor: FlowWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(FlowScalarFieldEnumSchema).optional(),
});

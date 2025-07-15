import { z } from 'zod';
import { FlowRunSelectObjectSchema } from './objects/FlowRunSelect.schema';
import { FlowRunIncludeObjectSchema } from './objects/FlowRunInclude.schema';
import { FlowRunOrderByWithRelationInputObjectSchema } from './objects/FlowRunOrderByWithRelationInput.schema';
import { FlowRunWhereInputObjectSchema } from './objects/FlowRunWhereInput.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './objects/FlowRunWhereUniqueInput.schema';
import { FlowRunScalarFieldEnumSchema } from './enums/FlowRunScalarFieldEnum.schema';

export const FlowRunFindFirstSchema = z.object({
  select: FlowRunSelectObjectSchema.optional(),
  include: FlowRunIncludeObjectSchema.optional(),
  orderBy: z
    .union([
      FlowRunOrderByWithRelationInputObjectSchema,
      FlowRunOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowRunWhereInputObjectSchema.optional(),
  cursor: FlowRunWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(FlowRunScalarFieldEnumSchema).optional(),
});

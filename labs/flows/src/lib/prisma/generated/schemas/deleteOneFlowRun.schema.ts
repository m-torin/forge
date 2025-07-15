import { z } from 'zod';
import { FlowRunSelectObjectSchema } from './objects/FlowRunSelect.schema';
import { FlowRunIncludeObjectSchema } from './objects/FlowRunInclude.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './objects/FlowRunWhereUniqueInput.schema';

export const FlowRunDeleteOneSchema = z.object({
  select: FlowRunSelectObjectSchema.optional(),
  include: FlowRunIncludeObjectSchema.optional(),
  where: FlowRunWhereUniqueInputObjectSchema,
});

import { z } from 'zod';
import { FlowRunSelectObjectSchema } from './objects/FlowRunSelect.schema';
import { FlowRunIncludeObjectSchema } from './objects/FlowRunInclude.schema';
import { FlowRunUpdateInputObjectSchema } from './objects/FlowRunUpdateInput.schema';
import { FlowRunUncheckedUpdateInputObjectSchema } from './objects/FlowRunUncheckedUpdateInput.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './objects/FlowRunWhereUniqueInput.schema';

export const FlowRunUpdateOneSchema = z.object({
  select: FlowRunSelectObjectSchema.optional(),
  include: FlowRunIncludeObjectSchema.optional(),
  data: z.union([
    FlowRunUpdateInputObjectSchema,
    FlowRunUncheckedUpdateInputObjectSchema,
  ]),
  where: FlowRunWhereUniqueInputObjectSchema,
});

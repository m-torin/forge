import { z } from 'zod';
import { FlowRunSelectObjectSchema } from './objects/FlowRunSelect.schema';
import { FlowRunIncludeObjectSchema } from './objects/FlowRunInclude.schema';
import { FlowRunCreateInputObjectSchema } from './objects/FlowRunCreateInput.schema';
import { FlowRunUncheckedCreateInputObjectSchema } from './objects/FlowRunUncheckedCreateInput.schema';

export const FlowRunCreateOneSchema = z.object({
  select: FlowRunSelectObjectSchema.optional(),
  include: FlowRunIncludeObjectSchema.optional(),
  data: z.union([
    FlowRunCreateInputObjectSchema,
    FlowRunUncheckedCreateInputObjectSchema,
  ]),
});

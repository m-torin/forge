import { z } from 'zod';
import { FlowRunSelectObjectSchema } from './objects/FlowRunSelect.schema';
import { FlowRunIncludeObjectSchema } from './objects/FlowRunInclude.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './objects/FlowRunWhereUniqueInput.schema';
import { FlowRunCreateInputObjectSchema } from './objects/FlowRunCreateInput.schema';
import { FlowRunUncheckedCreateInputObjectSchema } from './objects/FlowRunUncheckedCreateInput.schema';
import { FlowRunUpdateInputObjectSchema } from './objects/FlowRunUpdateInput.schema';
import { FlowRunUncheckedUpdateInputObjectSchema } from './objects/FlowRunUncheckedUpdateInput.schema';

export const FlowRunUpsertSchema = z.object({
  select: FlowRunSelectObjectSchema.optional(),
  include: FlowRunIncludeObjectSchema.optional(),
  where: FlowRunWhereUniqueInputObjectSchema,
  create: z.union([
    FlowRunCreateInputObjectSchema,
    FlowRunUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    FlowRunUpdateInputObjectSchema,
    FlowRunUncheckedUpdateInputObjectSchema,
  ]),
});

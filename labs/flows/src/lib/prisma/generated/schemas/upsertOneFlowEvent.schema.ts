import { z } from 'zod';
import { FlowEventSelectObjectSchema } from './objects/FlowEventSelect.schema';
import { FlowEventIncludeObjectSchema } from './objects/FlowEventInclude.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './objects/FlowEventWhereUniqueInput.schema';
import { FlowEventCreateInputObjectSchema } from './objects/FlowEventCreateInput.schema';
import { FlowEventUncheckedCreateInputObjectSchema } from './objects/FlowEventUncheckedCreateInput.schema';
import { FlowEventUpdateInputObjectSchema } from './objects/FlowEventUpdateInput.schema';
import { FlowEventUncheckedUpdateInputObjectSchema } from './objects/FlowEventUncheckedUpdateInput.schema';

export const FlowEventUpsertSchema = z.object({
  select: FlowEventSelectObjectSchema.optional(),
  include: FlowEventIncludeObjectSchema.optional(),
  where: FlowEventWhereUniqueInputObjectSchema,
  create: z.union([
    FlowEventCreateInputObjectSchema,
    FlowEventUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    FlowEventUpdateInputObjectSchema,
    FlowEventUncheckedUpdateInputObjectSchema,
  ]),
});

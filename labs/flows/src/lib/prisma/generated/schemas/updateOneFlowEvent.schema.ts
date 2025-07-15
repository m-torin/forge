import { z } from 'zod';
import { FlowEventSelectObjectSchema } from './objects/FlowEventSelect.schema';
import { FlowEventIncludeObjectSchema } from './objects/FlowEventInclude.schema';
import { FlowEventUpdateInputObjectSchema } from './objects/FlowEventUpdateInput.schema';
import { FlowEventUncheckedUpdateInputObjectSchema } from './objects/FlowEventUncheckedUpdateInput.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './objects/FlowEventWhereUniqueInput.schema';

export const FlowEventUpdateOneSchema = z.object({
  select: FlowEventSelectObjectSchema.optional(),
  include: FlowEventIncludeObjectSchema.optional(),
  data: z.union([
    FlowEventUpdateInputObjectSchema,
    FlowEventUncheckedUpdateInputObjectSchema,
  ]),
  where: FlowEventWhereUniqueInputObjectSchema,
});

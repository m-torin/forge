import { z } from 'zod';
import { FlowEventSelectObjectSchema } from './objects/FlowEventSelect.schema';
import { FlowEventIncludeObjectSchema } from './objects/FlowEventInclude.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './objects/FlowEventWhereUniqueInput.schema';

export const FlowEventFindUniqueSchema = z.object({
  select: FlowEventSelectObjectSchema.optional(),
  include: FlowEventIncludeObjectSchema.optional(),
  where: FlowEventWhereUniqueInputObjectSchema,
});

import { z } from 'zod';
import { FlowSelectObjectSchema } from './objects/FlowSelect.schema';
import { FlowIncludeObjectSchema } from './objects/FlowInclude.schema';
import { FlowWhereUniqueInputObjectSchema } from './objects/FlowWhereUniqueInput.schema';

export const FlowDeleteOneSchema = z.object({
  select: FlowSelectObjectSchema.optional(),
  include: FlowIncludeObjectSchema.optional(),
  where: FlowWhereUniqueInputObjectSchema,
});

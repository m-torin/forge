import { z } from 'zod';
import { InstanceSelectObjectSchema } from './objects/InstanceSelect.schema';
import { InstanceIncludeObjectSchema } from './objects/InstanceInclude.schema';
import { InstanceWhereUniqueInputObjectSchema } from './objects/InstanceWhereUniqueInput.schema';

export const InstanceFindUniqueSchema = z.object({
  select: InstanceSelectObjectSchema.optional(),
  include: InstanceIncludeObjectSchema.optional(),
  where: InstanceWhereUniqueInputObjectSchema,
});

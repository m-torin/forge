import { z } from 'zod';
import { ScheduledJobSelectObjectSchema } from './objects/ScheduledJobSelect.schema';
import { ScheduledJobIncludeObjectSchema } from './objects/ScheduledJobInclude.schema';
import { ScheduledJobOrderByWithRelationInputObjectSchema } from './objects/ScheduledJobOrderByWithRelationInput.schema';
import { ScheduledJobWhereInputObjectSchema } from './objects/ScheduledJobWhereInput.schema';
import { ScheduledJobWhereUniqueInputObjectSchema } from './objects/ScheduledJobWhereUniqueInput.schema';
import { ScheduledJobScalarFieldEnumSchema } from './enums/ScheduledJobScalarFieldEnum.schema';

export const ScheduledJobFindFirstSchema = z.object({
  select: ScheduledJobSelectObjectSchema.optional(),
  include: ScheduledJobIncludeObjectSchema.optional(),
  orderBy: z
    .union([
      ScheduledJobOrderByWithRelationInputObjectSchema,
      ScheduledJobOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: ScheduledJobWhereInputObjectSchema.optional(),
  cursor: ScheduledJobWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(ScheduledJobScalarFieldEnumSchema).optional(),
});

import { z } from 'zod';
import { AuditLogWhereInputObjectSchema } from './objects/AuditLogWhereInput.schema';
import { AuditLogOrderByWithAggregationInputObjectSchema } from './objects/AuditLogOrderByWithAggregationInput.schema';
import { AuditLogScalarWhereWithAggregatesInputObjectSchema } from './objects/AuditLogScalarWhereWithAggregatesInput.schema';
import { AuditLogScalarFieldEnumSchema } from './enums/AuditLogScalarFieldEnum.schema';

export const AuditLogGroupBySchema = z.object({
  where: AuditLogWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      AuditLogOrderByWithAggregationInputObjectSchema,
      AuditLogOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: AuditLogScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(AuditLogScalarFieldEnumSchema),
});

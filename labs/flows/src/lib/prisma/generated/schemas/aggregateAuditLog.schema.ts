import { z } from 'zod';
import { AuditLogOrderByWithRelationInputObjectSchema } from './objects/AuditLogOrderByWithRelationInput.schema';
import { AuditLogWhereInputObjectSchema } from './objects/AuditLogWhereInput.schema';
import { AuditLogWhereUniqueInputObjectSchema } from './objects/AuditLogWhereUniqueInput.schema';
import { AuditLogCountAggregateInputObjectSchema } from './objects/AuditLogCountAggregateInput.schema';
import { AuditLogMinAggregateInputObjectSchema } from './objects/AuditLogMinAggregateInput.schema';
import { AuditLogMaxAggregateInputObjectSchema } from './objects/AuditLogMaxAggregateInput.schema';

export const AuditLogAggregateSchema = z.object({
  orderBy: z
    .union([
      AuditLogOrderByWithRelationInputObjectSchema,
      AuditLogOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: AuditLogWhereInputObjectSchema.optional(),
  cursor: AuditLogWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), AuditLogCountAggregateInputObjectSchema])
    .optional(),
  _min: AuditLogMinAggregateInputObjectSchema.optional(),
  _max: AuditLogMaxAggregateInputObjectSchema.optional(),
});

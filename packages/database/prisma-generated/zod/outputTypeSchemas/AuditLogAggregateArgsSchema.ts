import { z } from 'zod';
import type { Prisma } from '../../client';
import { AuditLogWhereInputSchema } from '../inputTypeSchemas/AuditLogWhereInputSchema';
import { AuditLogOrderByWithRelationInputSchema } from '../inputTypeSchemas/AuditLogOrderByWithRelationInputSchema';
import { AuditLogWhereUniqueInputSchema } from '../inputTypeSchemas/AuditLogWhereUniqueInputSchema';

export const AuditLogAggregateArgsSchema: z.ZodType<Prisma.AuditLogAggregateArgs> = z
  .object({
    where: AuditLogWhereInputSchema.optional(),
    orderBy: z
      .union([
        AuditLogOrderByWithRelationInputSchema.array(),
        AuditLogOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: AuditLogWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default AuditLogAggregateArgsSchema;

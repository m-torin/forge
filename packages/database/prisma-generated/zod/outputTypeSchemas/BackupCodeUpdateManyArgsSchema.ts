import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeUpdateManyMutationInputSchema } from '../inputTypeSchemas/BackupCodeUpdateManyMutationInputSchema';
import { BackupCodeUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BackupCodeUncheckedUpdateManyInputSchema';
import { BackupCodeWhereInputSchema } from '../inputTypeSchemas/BackupCodeWhereInputSchema';

export const BackupCodeUpdateManyArgsSchema: z.ZodType<Prisma.BackupCodeUpdateManyArgs> = z
  .object({
    data: z.union([
      BackupCodeUpdateManyMutationInputSchema,
      BackupCodeUncheckedUpdateManyInputSchema,
    ]),
    where: BackupCodeWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default BackupCodeUpdateManyArgsSchema;

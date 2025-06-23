import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeUpdateManyMutationInputSchema } from '../inputTypeSchemas/BackupCodeUpdateManyMutationInputSchema';
import { BackupCodeUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BackupCodeUncheckedUpdateManyInputSchema';
import { BackupCodeWhereInputSchema } from '../inputTypeSchemas/BackupCodeWhereInputSchema';

export const BackupCodeUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BackupCodeUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        BackupCodeUpdateManyMutationInputSchema,
        BackupCodeUncheckedUpdateManyInputSchema,
      ]),
      where: BackupCodeWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default BackupCodeUpdateManyAndReturnArgsSchema;

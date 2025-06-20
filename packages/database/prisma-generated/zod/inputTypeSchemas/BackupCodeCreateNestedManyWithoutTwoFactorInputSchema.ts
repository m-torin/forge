import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeCreateWithoutTwoFactorInputSchema } from './BackupCodeCreateWithoutTwoFactorInputSchema';
import { BackupCodeUncheckedCreateWithoutTwoFactorInputSchema } from './BackupCodeUncheckedCreateWithoutTwoFactorInputSchema';
import { BackupCodeCreateOrConnectWithoutTwoFactorInputSchema } from './BackupCodeCreateOrConnectWithoutTwoFactorInputSchema';
import { BackupCodeCreateManyTwoFactorInputEnvelopeSchema } from './BackupCodeCreateManyTwoFactorInputEnvelopeSchema';
import { BackupCodeWhereUniqueInputSchema } from './BackupCodeWhereUniqueInputSchema';

export const BackupCodeCreateNestedManyWithoutTwoFactorInputSchema: z.ZodType<Prisma.BackupCodeCreateNestedManyWithoutTwoFactorInput> = z.object({
  create: z.union([ z.lazy(() => BackupCodeCreateWithoutTwoFactorInputSchema),z.lazy(() => BackupCodeCreateWithoutTwoFactorInputSchema).array(),z.lazy(() => BackupCodeUncheckedCreateWithoutTwoFactorInputSchema),z.lazy(() => BackupCodeUncheckedCreateWithoutTwoFactorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BackupCodeCreateOrConnectWithoutTwoFactorInputSchema),z.lazy(() => BackupCodeCreateOrConnectWithoutTwoFactorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BackupCodeCreateManyTwoFactorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BackupCodeWhereUniqueInputSchema),z.lazy(() => BackupCodeWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default BackupCodeCreateNestedManyWithoutTwoFactorInputSchema;

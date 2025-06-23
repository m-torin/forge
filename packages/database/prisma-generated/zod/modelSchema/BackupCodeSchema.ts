import { z } from 'zod';

/////////////////////////////////////////
// BACKUP CODE SCHEMA
/////////////////////////////////////////

export const BackupCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  codeHash: z.string(),
  userId: z.string(),
  twoFactorId: z.string(),
  used: z.boolean(),
  usedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

export type BackupCode = z.infer<typeof BackupCodeSchema>;

export default BackupCodeSchema;

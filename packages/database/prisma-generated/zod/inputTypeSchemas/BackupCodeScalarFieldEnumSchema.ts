import { z } from 'zod';

export const BackupCodeScalarFieldEnumSchema = z.enum(['id','code','codeHash','userId','twoFactorId','used','usedAt','createdAt']);

export default BackupCodeScalarFieldEnumSchema;

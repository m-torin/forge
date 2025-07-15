import { z } from 'zod';

export const RunStatusSchema = z.enum([
  'failed',
  'inProgress',
  'paused',
  'successful',
]);

import { z } from 'zod';

export const FlowStatisticsScalarFieldEnumSchema = z.enum([
  'id',
  'flowId',
  'totalRuns',
  'successfulRuns',
  'failedRuns',
  'lastUpdated',
]);

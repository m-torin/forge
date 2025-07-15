import { z } from 'zod';

export const FlowMethodSchema = z.enum([
  'graphOnly',
  'observable',
  'sequential',
]);

import { z } from 'zod';

export const InfraTypeSchema = z.enum(['database', 'graphOnly', 'other']);

import { z } from 'zod';

export const StartedBySchema = z.enum(['manual', 'scheduled']);

import { z } from 'zod';

export const JrChartMethodSchema = z.enum(['SITEMAP', 'GRID']);

export type JrChartMethodType = `${z.infer<typeof JrChartMethodSchema>}`;

export default JrChartMethodSchema;

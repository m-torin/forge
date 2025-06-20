import { z } from 'zod';

export const JollyRogerScalarFieldEnumSchema = z.enum(['id','canChart','chartingMethod','brandId','sitemaps','gridUrls','pdpUrlPatterns']);

export default JollyRogerScalarFieldEnumSchema;

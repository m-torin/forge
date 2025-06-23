import { z } from 'zod';

export const JrExtractionRuleScalarFieldEnumSchema = z.enum([
  'id',
  'jollyRogerId',
  'fieldName',
  'isActive',
  'selectors',
  'mustContain',
  'cannotContain',
  'lastSuccessfulSelector',
  'successRate',
  'lastTestedAt',
  'notes',
]);

export default JrExtractionRuleScalarFieldEnumSchema;

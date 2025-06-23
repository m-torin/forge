import { z } from 'zod';

export const JrFindReplaceRejectScalarFieldEnumSchema = z.enum([
  'id',
  'lookFor',
  'replaceWith',
  'ruleAction',
  'isRegex',
  'regexFlags',
  'priority',
]);

export default JrFindReplaceRejectScalarFieldEnumSchema;

import { Prisma } from '../../../../prisma-generated/client';
import { validationRules } from './rules';
import { ValidationError } from './types';

// Generic validation function that works with proper types
function validateData<T extends string>(model: T, operation: 'create' | 'update', data: any): void {
  const rules = validationRules[model]?.[operation];
  if (!rules) return;

  for (const rule of rules) {
    // Handle polymorphic validation
    if (rule.field === '_polymorphic') {
      if (!rule.validate(data)) {
        throw new ValidationError(rule.message(data), 'polymorphic', data, model);
      }
      continue;
    }

    // Skip if field is not being set/updated
    if (!(rule.field in data)) continue;

    const value = data[rule.field];
    if (!rule.validate(value)) {
      throw new ValidationError(rule.message(value), rule.field, value, model);
    }
  }
}

// List of models that have validation rules (auth-related only)
type ValidatedModels =
  | 'user'
  | 'session'
  | 'account'
  | 'verification'
  | 'organization'
  | 'member'
  | 'team'
  | 'teamMember'
  | 'invitation'
  | 'apiKey'
  | 'twoFactor'
  | 'backupCode'
  | 'passkey'
  | 'auditLog';

// Helper type to check if a model has validation rules
function hasValidationRules(model: string): model is ValidatedModels {
  return model in validationRules;
}

// Enhanced validation extension using $allModels for cleaner implementation
export const validationExtension = Prisma.defineExtension({
  name: 'validation',
  query: {
    $allModels: {
      async create({ model, args, query }) {
        // Only validate if this model has validation rules
        if (model && hasValidationRules(model)) {
          validateData(model, 'create', args.data);
        }
        return query(args);
      },

      async update({ model, args, query }) {
        // Only validate if this model has validation rules and data is provided
        if (model && hasValidationRules(model) && args.data) {
          validateData(model, 'update', args.data);
        }
        return query(args);
      },

      async upsert({ model, args, query }) {
        // Only validate if this model has validation rules
        if (model && hasValidationRules(model)) {
          validateData(model, 'create', args.create);
          if (args.update) {
            validateData(model, 'update', args.update);
          }
        }
        return query(args);
      },

      // Also handle createMany for batch operations
      async createMany({ model, args, query }) {
        // Only validate if this model has validation rules
        if (model && hasValidationRules(model) && args.data) {
          // Handle both array and single data inputs
          const dataArray = Array.isArray(args.data) ? args.data : [args.data];
          dataArray.forEach(data => {
            validateData(model, 'create', data);
          });
        }
        return query(args);
      },

      // Handle updateMany for batch operations
      async updateMany({ model, args, query }) {
        // Only validate if this model has validation rules and data is provided
        if (model && hasValidationRules(model) && args.data) {
          validateData(model, 'update', args.data);
        }
        return query(args);
      },
    },
  },
});

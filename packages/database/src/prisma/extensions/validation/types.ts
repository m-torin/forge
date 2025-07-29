export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
    public model: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export type ValidationRule<T = any> = {
  field: string;
  validate: (value: T) => boolean;
  message: (value: T) => string;
};

export type ModelValidationRules = {
  [model: string]: {
    create?: ValidationRule[];
    update?: ValidationRule[];
  };
};

// Helper to check if only one field in a group is set
export function exactlyOneSet(data: Record<string, any>, fields: string[]): boolean {
  const setFields = fields.filter(field => data[field] !== null && data[field] !== undefined);
  return setFields.length === 1;
}

// Helper to count how many fields are set
export function countSet(data: Record<string, any>, fields: string[]): number {
  return fields.filter(field => data[field] !== null && data[field] !== undefined).length;
}

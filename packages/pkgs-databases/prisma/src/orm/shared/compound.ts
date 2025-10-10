/**
 * Compound key utilities extracted from shared-operations to keep modules focused.
 */

export type CompoundKeyPattern = {
  type: 'nested' | 'compound' | 'composite';
  fields: string[];
  relationPath?: string;
};

/**
 * Apply a compound key pattern transformation to a where object.
 */
export function handleCompoundKeys(where: any, pattern?: CompoundKeyPattern): any {
  if (!pattern || !where) return where;

  switch (pattern.type) {
    case 'nested':
      return convertToNestedWhere(where, pattern);
    case 'compound':
      return convertToCompoundWhere(where, pattern);
    case 'composite':
      return convertToCompositeWhere(where, pattern);
    default:
      return where;
  }
}

/**
 * Convert compound key to nested relationship query
 * Example: fields ['userId','postId'] with relationPath 'user'
 *   where: { userId, postId } => { user: { userId }, postId }
 */
export function convertToNestedWhere(where: any, pattern: CompoundKeyPattern): any {
  const { fields, relationPath } = pattern;
  if (!relationPath || fields.length !== 2) return where;

  const [field1, field2] = fields;
  const hasField1 = where[field1] !== undefined;
  const hasField2 = where[field2] !== undefined;

  if (hasField1 && hasField2) {
    const nestedWhere = { ...where };
    delete nestedWhere[field1];
    delete nestedWhere[field2];

    nestedWhere[relationPath] = {
      [field1]: where[field1],
    };
    nestedWhere[field2] = where[field2];

    return nestedWhere;
  }

  return where;
}

/**
 * Convert to proper compound where clause
 * Example: fields ['productId','categoryId'] => where: { productId, categoryId } becomes:
 *   { productId_categoryId: { productId, categoryId } }
 */
export function convertToCompoundWhere(where: any, pattern: CompoundKeyPattern): any {
  const { fields } = pattern;
  if (fields.length < 2) return where;

  const compoundFieldName = fields.join('_');
  const hasAllFields = fields.every(field => where[field] !== undefined);

  if (hasAllFields) {
    const compoundWhere = { ...where };
    const compoundValue: any = {};

    fields.forEach(field => {
      compoundValue[field] = where[field];
      delete compoundWhere[field];
    });

    compoundWhere[compoundFieldName] = compoundValue;
    return compoundWhere;
  }

  return where;
}

/**
 * Convert to composite key pattern
 * Example: fields ['a','b','c'] => where: { a,b,c, other } becomes:
 *   { AND: [{a},{b},{c}], other }
 */
export function convertToCompositeWhere(where: any, pattern: CompoundKeyPattern): any {
  const { fields } = pattern;
  const hasAllFields = fields.every(field => where[field] !== undefined);

  if (hasAllFields) {
    return {
      AND: fields.map(field => ({ [field]: where[field] })),
      ...Object.fromEntries(Object.entries(where).filter(([key]) => !fields.includes(key))),
    };
  }

  return where;
}
export const COMPOUND_KEY_PATTERNS: Record<string, CompoundKeyPattern> = {
  // Registry patterns
  registryItem: {
    type: 'nested',
    fields: ['registryId', 'productId'],
    relationPath: 'registry',
  },
  registryPurchaseJoin: {
    type: 'nested',
    fields: ['registryId', 'orderNumber'],
    relationPath: 'registryItem',
  },
  registryUserJoin: {
    type: 'compound',
    fields: ['userId', 'registryId'],
  },

  // Other common patterns
  userPost: {
    type: 'nested',
    fields: ['userId', 'postId'],
    relationPath: 'user',
  },
  productCategory: {
    type: 'composite',
    fields: ['productId', 'categoryId'],
  },
};

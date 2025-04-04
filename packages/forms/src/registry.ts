'use client';

import { FieldConfig, FieldRegistry, NestedPathOptions, Registry, Relationship, DependencyGraph } from './types';

/**
 * Default options for nested path handling
 */
const DEFAULT_NESTED_PATH_OPTIONS: NestedPathOptions = {
  separator: '.',
  arrayIndicator: '[i]'
};

/**
 * Creates a field index for efficient field lookups
 */
export function createFieldIndex<T>(fields: FieldRegistry<T>) {
  // Create indexes for faster lookups
  const byGroup = groupBy(Object.values(fields), 'group');
  const byTab = groupBy(Object.values(fields), 'tab');
  const byType = groupBy(Object.values(fields), 'type');

  return {
    getFieldsByGroup: (group: string) => byGroup[group] || [],
    getFieldsByTab: (tab: string) => byTab[tab] || [],
    getFieldsByType: (type: string) => byType[type] || [],
    getField: (name: string) => fields[name]
  };
}

/**
 * Creates a registry instance with field management functionality
 */
export function createRegistry<T>(fields: FieldRegistry<T>): Registry<T> {
  // Create indexes for faster lookups
  const byGroup = groupBy(Object.values(fields), 'group');
  const byTab = groupBy(Object.values(fields), 'tab');
  const byType = groupBy(Object.values(fields), 'type');

  // Create dependency graph for optimization
  const dependencyGraph = createDependencyGraph(fields);

  return {
    fields,

    getField: (name: string) => fields[name],

    getFieldsByGroup: (group: string) =>
      byGroup[group] || [],

    getFieldsByTab: (tab: string) =>
      byTab[tab] || [],

    getFieldsByType: (type: string) =>
      byType[type] || [],

    getVisibleFields: (values: T) => {
      return Object.keys(fields).filter(fieldName =>
        isFieldVisible(fieldName, values, fields)
      );
    },

    evaluateRelationships: (values: T) =>
      evaluateRelationships(values, fields),

    isFieldVisible: (fieldName: string, values: T) =>
      isFieldVisible(fieldName, values, fields),

    getDependentFields: (fieldName: string) =>
      dependencyGraph[fieldName] || [],

    // Nested field methods
    getNestedField: (path: string) => {
      const parts = splitPath(path);
      let currentFields = fields;
      let currentField: FieldConfig | undefined;

      // Navigate through the path parts
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isArrayIndex = part.match(/\[\d+\]/);

        if (isArrayIndex) {
          // For array items, get the field config for the array itself
          const arrayPath = parts.slice(0, i).join('.');
          currentField = getNestedFieldInternal(arrayPath, fields);

          // If we found the array field and it has nested fields, use those
          if (currentField?.isArray && currentField.nestedFields) {
            return currentField.nestedFields['item']; // Use the item template
          }

          return undefined;
        } else {
          // For regular nested fields
          currentField = currentFields[part];

          if (!currentField) return undefined;

          // If this is the last part, return the field
          if (i === parts.length - 1) return currentField;

          // Otherwise, continue with nested fields if available
          if (currentField.nestedFields) {
            currentFields = currentField.nestedFields;
          } else {
            return undefined;
          }
        }
      }

      return undefined;
    },

    getArrayItemField: (arrayPath: string) => {
      const field = getNestedFieldInternal(arrayPath, fields);
      if (field?.isArray && field.nestedFields) {
        return field.nestedFields['item']; // Use the item template
      }
      return undefined;
    }
  };
}

/**
 * Helper function to group fields by a property
 */
function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const groupKey = item[key] as unknown as string;
    if (!groupKey) return acc;

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Creates a dependency graph for fields based on their relationships
 * This allows for efficient lookup of which fields depend on a given field
 */
function createDependencyGraph<T>(fields: FieldRegistry<T>): DependencyGraph {
  const graph: DependencyGraph = {};

  Object.entries(fields).forEach(([fieldName, field]) => {
    if (!field.relationships?.length) return;

    field.relationships.forEach(rel => {
      const deps = Array.isArray(rel.dependsOn) ? rel.dependsOn : [rel.dependsOn];

      deps.forEach(dep => {
        if (!graph[dep]) graph[dep] = [];
        if (!graph[dep].includes(fieldName)) {
          graph[dep].push(fieldName);
        }
      });
    });
  });

  return graph;
}

/**
 * Evaluates all relationships for the given values
 * Returns a map of field names to relationship results
 */
function evaluateRelationships<T>(
  values: T,
  fields: FieldRegistry<T>
): Record<string, Record<string, boolean>> {
  const result: Record<string, Record<string, boolean>> = {};

  // Evaluate each field's relationships
  Object.entries(fields).forEach(([fieldName, field]) => {
    if (!field.relationships?.length) return;

    result[fieldName] = {};

    field.relationships.forEach(relationship => {
      const isConditionMet = relationship.condition(values);

      // Store the result of this relationship
      result[fieldName][relationship.type] = isConditionMet;
    });
  });

  return result;
}

/**
 * Checks if a field should be visible based on its relationships
 */
export function isFieldVisible<T>(
  fieldName: string,
  values: T,
  fields: FieldRegistry<T>
): boolean {
  const field = fields[fieldName];
  if (!field || !field.relationships?.length) return true;

  // Find visibility relationships
  const visibilityRelationships = field.relationships.filter(
    r => r.type === 'visibility'
  );

  if (!visibilityRelationships.length) return true;

  // Check if all visibility conditions are met
  return visibilityRelationships.every(r => r.condition(values));
}

/**
 * Gets the dependent fields for a specific field
 * This is a utility function that can be used outside the registry
 */
export function getDependentFields<T>(
  fieldName: string,
  registry: Registry<T>
): string[] {
  return registry.getDependentFields(fieldName);
}

// ===== Nested Path Utilities =====

/**
 * Splits a path into its parts
 */
export function splitPath(path: string, options?: NestedPathOptions): string[] {
  const opts = { ...DEFAULT_NESTED_PATH_OPTIONS, ...options };
  return path.split(opts.separator);
}

/**
 * Gets a nested value from an object using a path
 */
export function getNestedValue<T>(
  obj: T,
  path: string,
  options?: NestedPathOptions
): any {
  if (!obj || !path) return undefined;

  const opts = { ...DEFAULT_NESTED_PATH_OPTIONS, ...options };
  const parts = path.split(opts.separator);

  return parts.reduce((acc, part) => {
    // Handle array indices
    const match = part.match(/(\w+)\[(\d+)\]/);
    if (match) {
      const [_, arrayName, indexStr] = match;
      const index = parseInt(indexStr, 10);
      return acc && acc[arrayName] && acc[arrayName][index] !== undefined
        ? acc[arrayName][index]
        : undefined;
    }

    // Handle regular properties
    return acc && acc[part] !== undefined ? acc[part] : undefined;
  }, obj as any);
}

/**
 * Sets a nested value in an object using a path
 */
export function setNestedValue<T>(
  obj: T,
  path: string,
  value: any,
  options?: NestedPathOptions
): T {
  if (!obj || !path) return obj;

  const opts = { ...DEFAULT_NESTED_PATH_OPTIONS, ...options };
  const parts = path.split(opts.separator);
  const result = { ...obj } as any;

  let current = result;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;

    // Handle array indices
    const match = part.match(/(\w+)\[(\d+)\]/);
    if (match) {
      const [_, arrayName, indexStr] = match;
      const index = parseInt(indexStr, 10);

      // Ensure array exists
      if (!current[arrayName]) {
        current[arrayName] = [];
      }

      // Ensure array is long enough
      while (current[arrayName].length <= index) {
        current[arrayName].push(undefined);
      }

      if (isLast) {
        current[arrayName][index] = value;
      } else {
        if (!current[arrayName][index]) {
          current[arrayName][index] = {};
        }
        current = current[arrayName][index];
      }
    } else {
      // Handle regular properties
      if (isLast) {
        current[part] = value;
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }

  return result;
}

/**
 * Internal helper to get a nested field from the registry
 */
function getNestedFieldInternal<T>(
  path: string,
  fields: FieldRegistry<T>,
  options?: NestedPathOptions
): FieldConfig | undefined {
  if (!path) return undefined;

  const opts = { ...DEFAULT_NESTED_PATH_OPTIONS, ...options };
  const parts = path.split(opts.separator);

  let currentFields = fields;
  let currentField: FieldConfig | undefined;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Handle array indices (ignore them for field lookup)
    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
    const fieldName = arrayMatch ? arrayMatch[1] : part;

    currentField = currentFields[fieldName];

    if (!currentField) return undefined;

    // If this is the last part, return the field
    if (i === parts.length - 1) return currentField;

    // Otherwise, continue with nested fields if available
    if (currentField.nestedFields) {
      currentFields = currentField.nestedFields;
    } else {
      return undefined;
    }
  }

  return currentField;
}

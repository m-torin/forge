// typescript.ts
import type {
  SchemaResult,
  AnalyzerOptions,
  BaseType,
  ExtendedType,
} from '../types';
import { Patterns } from '../utils';

const mapTsTypeToBase = (tsType: string): BaseType => {
  const normalized = tsType.toLowerCase().trim();

  switch (normalized) {
    case 'string':
      return 'string';
    case 'number':
    case 'bigint':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'symbol':
      return 'object';
    case 'date':
      return 'date';
    case 'array':
      return 'array';
    default:
      return 'object';
  }
};

export const analyzeTypeScript = (
  code: string,
  options?: AnalyzerOptions,
): SchemaResult => {
  const { strict = true } = options ?? {};

  try {
    if (!code?.trim()) {
      throw new Error('Empty TypeScript code');
    }

    const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();

    // Check for interface/type/class declarations
    const interfaceMatch = cleanCode.match(Patterns.TypeScript.INTERFACE);
    const typeMatch = cleanCode.match(Patterns.TypeScript.TYPE_ALIAS);
    const classMatch = cleanCode.match(Patterns.TypeScript.CLASS);

    if (interfaceMatch || typeMatch || classMatch) {
      return {
        baseType: 'object',
        specificType: interfaceMatch
          ? 'interface'
          : typeMatch
            ? 'type'
            : 'class',
        metadata: {
          isInterface: Boolean(interfaceMatch),
          isType: Boolean(typeMatch),
          isClass: Boolean(classMatch),
          name:
            (interfaceMatch?.[1] || typeMatch?.[1] || classMatch?.[1]) ??
            undefined,
          hasGenerics: Patterns.TypeScript.GENERIC.test(cleanCode),
        },
        confidence: 1,
        language: 'typescript',
      };
    }

    // Check for arrays/tuples
    const arrayMatch =
      cleanCode.match(Patterns.TypeScript.ARRAY.BRACKET) ||
      cleanCode.match(Patterns.TypeScript.ARRAY.GENERIC);
    const tupleMatch = cleanCode.match(Patterns.TypeScript.ARRAY.TUPLE);

    if (arrayMatch) {
      return {
        baseType: 'array',
        specificType: 'array',
        metadata: {
          elementType: mapTsTypeToBase(arrayMatch[1]),
          isHomogeneous: true,
        },
        confidence: 1,
        language: 'typescript',
      };
    }

    if (tupleMatch) {
      const types = tupleMatch[1].split(',').map((t) => t.trim());
      return {
        baseType: 'array',
        specificType: 'tuple',
        metadata: {
          elements: types.map((t) => ({ type: mapTsTypeToBase(t) })),
          isHomogeneous: false,
          isFixedLength: true, // Corrected property name
          length: types.length,
        },
        confidence: 1,
        language: 'typescript',
      };
    }

    // Check for unions/intersections
    const hasUnions = Patterns.TypeScript.UNION.test(cleanCode);
    const hasIntersections = Patterns.TypeScript.INTERSECTION.test(cleanCode);

    if (hasUnions || hasIntersections) {
      const types = cleanCode
        .split(
          hasUnions
            ? Patterns.TypeScript.UNION
            : Patterns.TypeScript.INTERSECTION,
        )
        .map((t) => t.trim());

      return {
        baseType: 'object',
        specificType: hasUnions ? 'union' : 'intersection',
        metadata: {
          isUnion: hasUnions,
          isIntersection: hasIntersections,
          types: types.map((t) => mapTsTypeToBase(t)),
        },
        confidence: 1,
        language: 'typescript',
      };
    }

    // Check for primitive types
    if (Patterns.TypeScript.PRIMITIVE.test(cleanCode)) {
      const baseType = mapTsTypeToBase(cleanCode);
      return {
        baseType,
        specificType: cleanCode.toLowerCase() as ExtendedType, // Cast to ExtendedType
        metadata: {},
        confidence: 1,
        language: 'typescript',
      };
    }

    // Default object type
    return {
      baseType: 'object',
      specificType: 'object',
      metadata: {},
      confidence: 0.5,
      language: 'typescript',
    };
  } catch (error) {
    if (strict) throw error;
    return {
      baseType: 'null',
      specificType: 'null',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      confidence: 0,
      language: 'typescript',
    };
  }
};

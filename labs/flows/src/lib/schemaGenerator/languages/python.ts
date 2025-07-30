// python.ts
import type { SchemaResult, AnalyzerOptions } from '../types';
import { Patterns } from '../utils';

export const analyzePython = (
  code: string,
  options?: AnalyzerOptions,
): SchemaResult => {
  const { strict = true } = options ?? {};

  try {
    if (!code?.trim()) {
      throw new Error('Empty Python code');
    }

    const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|#.*/g, '').trim();

    // NumPy patterns
    for (const [key, pattern] of Object.entries(Patterns.Python.NUMPY)) {
      if (pattern.test(cleanCode)) {
        const dtypeMatch = cleanCode.match(/dtype=['"]?(\w+)['"]?/);
        const shapeMatch = cleanCode.match(/shape=$$(.*?)$$/); // Updated regex
        const itemsizeMatch = cleanCode.match(/itemsize=(\d+)/);

        return {
          baseType: key === 'SCALAR' ? 'number' : 'array',
          specificType: 'numpy',
          metadata: {
            isNumpy: true,
            subtype: key.toLowerCase(),
            dtype: dtypeMatch?.[1],
            dimensions: cleanCode.includes('ndarray')
              ? shapeMatch?.[1]?.split(',').map((d) => parseInt(d.trim()))
              : undefined,
            itemsize: parseInt(itemsizeMatch?.[1] ?? '0'),
            isMatrix: key === 'MATRIX',
            isMultiIndex: cleanCode.includes('MultiIndex'),
          },
          confidence: 1,
          language: 'python',
        };
      }
    }

    // Pandas patterns
    for (const [key, pattern] of Object.entries(Patterns.Python.PANDAS)) {
      if (pattern.test(cleanCode)) {
        const columnsMatch = cleanCode.match(/columns\s*=\s*$$(.*?)$$/); // Updated regex
        const _dtypeMatch = cleanCode.match(/dtype=['"]?(\w+)['"]?/);
        const isMultiIndex = cleanCode.includes('MultiIndex');

        return {
          baseType: 'dataframe',
          specificType: 'pandas',
          metadata: {
            isPandas: true,
            subtype: key.toLowerCase(),
            hasIndex: key === 'DATAFRAME' || key === 'SERIES',
            isCategorical: key === 'CATEGORICAL',
            isMultiIndex, // Ensure consistency
            columns: columnsMatch?.[1]
              ?.split(',')
              .map((c) => c.trim().replace(/[\'\"]/g, '')), // Now valid
          },
          confidence: 1,
          language: 'python',
        };
      }
    }

    // Python built-in types
    for (const [key, pattern] of Object.entries(Patterns.Python.TYPES)) {
      if (pattern.test(cleanCode)) {
        switch (key) {
          case 'SET':
            return {
              baseType: 'array',
              specificType: 'set',
              metadata: {
                uniqueItems: true,
                isHomogeneous: true,
              },
              confidence: 1,
              language: 'python',
            };
          case 'DICT':
            return {
              baseType: 'object',
              specificType: cleanCode.includes('OrderedDict')
                ? 'ordered_map'
                : 'dict',
              metadata: {
                isOrdered: cleanCode.includes('OrderedDict'),
                isDefaultDict: cleanCode.includes('defaultdict'),
                isCounter: cleanCode.includes('Counter'),
              },
              confidence: 1,
              language: 'python',
            };
          case 'NUMERIC':
            return {
              baseType: 'number',
              specificType: cleanCode.includes('Decimal')
                ? 'decimal'
                : cleanCode.includes('complex')
                  ? 'complex'
                  : cleanCode.includes('float')
                    ? 'float'
                    : 'integer',
              metadata: {
                isDecimal: cleanCode.includes('Decimal'),
                isComplex: cleanCode.includes('complex'),
              },
              confidence: 1,
              language: 'python',
            };
          case 'BYTES':
            return {
              baseType: 'string',
              specificType: 'bytes',
              metadata: {
                encoding: 'utf-8',
                isBinary: true,
              },
              confidence: 1,
              language: 'python',
            };
        }
      }
    }

    // Default python object
    return {
      baseType: 'object',
      specificType: 'object',
      metadata: {},
      confidence: 0.5,
      language: 'python',
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
      language: 'python',
    };
  }
};

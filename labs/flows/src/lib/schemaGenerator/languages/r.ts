// r.ts
import type { SchemaResult, AnalyzerOptions, ExtendedType } from '../types';
import { Patterns } from '../utils';

export const analyzeR = (
  code: string,
  options?: AnalyzerOptions,
): SchemaResult => {
  const { strict = true } = options ?? {};

  try {
    if (!code?.trim()) {
      throw new Error('Empty R code');
    }

    const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|#.*/g, '').trim();

    // Vector patterns
    for (const [key, pattern] of Object.entries(Patterns.R.VECTOR)) {
      if (pattern.test(cleanCode)) {
        switch (key) {
          case 'ATOMIC':
            const match = cleanCode.match(pattern);
            const type = match?.[1];
            return {
              baseType:
                type === 'character'
                  ? 'string'
                  : type === 'logical'
                    ? 'boolean'
                    : 'number',
              specificType: (type as ExtendedType) ?? 'atomic', // Cast to ExtendedType
              metadata: {
                isVector: true,
                vectorType: 'atomic',
                elementType: type as ExtendedType, // Cast to ExtendedType
              },
              confidence: 1,
              language: 'r',
            };
          case 'FACTOR':
            return {
              baseType: 'array',
              specificType: 'factor',
              metadata: {
                isFactor: true,
                hasLevels: true,
                isOrdered: cleanCode.includes('ordered'),
                levels: cleanCode
                  .match(/levels\s*=\s*c$$(.*?)$$/)?.[1]
                  ?.split(',')
                  .map((l) => l.trim().replace(/[\'\"]/g, '')),
              },
              confidence: 1,
              language: 'r',
            };
          case 'TIME':
            return {
              baseType: 'date',
              specificType:
                (cleanCode
                  .match(pattern)?.[1]
                  ?.toLowerCase() as ExtendedType) ?? 'date', // Cast to ExtendedType
              metadata: {
                hasTimezone:
                  cleanCode.includes('POSIXct') ||
                  cleanCode.includes('POSIXlt'),
                isDifftime: cleanCode.includes('difftime'),
                timeClass: cleanCode.match(pattern)?.[1],
                hasNamed: cleanCode.includes('tzone'),
              },
              confidence: 1,
              language: 'r',
            };
        }
      }
    }

    // Frame patterns
    for (const [key, pattern] of Object.entries(Patterns.R.FRAME)) {
      if (pattern.test(cleanCode)) {
        switch (key) {
          case 'DATA':
            return {
              baseType: 'dataframe',
              specificType:
                (cleanCode
                  .match(pattern)?.[1]
                  ?.toLowerCase() as ExtendedType) ?? 'data.frame', // Cast to ExtendedType
              metadata: {
                isDataFrame: true,
                isTibble: cleanCode.includes('tibble'),
                isDataTable: cleanCode.includes('data.table'),
                hasRowNames: cleanCode.includes('row.names'),
                dimensions: [
                  parseInt(cleanCode.match(/nrow\s*=\s*(\d+)/)?.[1] ?? '0'),
                  parseInt(cleanCode.match(/ncol\s*=\s*(\d+)/)?.[1] ?? '0'),
                ],
                columnTypes: cleanCode
                  .match(/colnames\s*=\s*c$$(.*?)$$/)?.[1]
                  ?.split(',')
                  .map((c) => c.trim().replace(/[\'\"]/g, '')),
              },
              confidence: 1,
              language: 'r',
            };
          case 'SPECIAL':
            return {
              baseType: 'array',
              specificType:
                (cleanCode
                  .match(pattern)?.[1]
                  ?.toLowerCase() as ExtendedType) ?? 'matrix', // Cast to ExtendedType
              metadata: {
                isMatrix: cleanCode.includes('matrix'),
                isArray: cleanCode.includes('array'),
                dimensions: cleanCode.includes('array')
                  ? (cleanCode
                      .match(/dim\s*=\s*c$$(.*?)$$/)?.[1]
                      ?.split(',')
                      .map((d) => parseInt(d.trim())) ?? [0, 0, 0])
                  : [
                      parseInt(cleanCode.match(/nrow\s*=\s*(\d+)/)?.[1] ?? '0'),
                      parseInt(cleanCode.match(/ncol\s*=\s*(\d+)/)?.[1] ?? '0'),
                    ],
                byrow: cleanCode.includes('byrow = TRUE'),
              },
              confidence: 1,
              language: 'r',
            };
        }
      }
    }

    // S3/S4 class detection
    for (const [key, pattern] of Object.entries(Patterns.R.CLASS)) {
      if (pattern.test(cleanCode)) {
        return {
          baseType: 'object',
          specificType: `${key.toLowerCase()}_class` as ExtendedType, // Cast to ExtendedType
          metadata: {
            isS3: key === 'S3',
            isS4: key === 'S4',
            className:
              cleanCode.match(/setClass$$[\'\"](.*?)[\'\"]/)?.[1] ??
              cleanCode.match(/class\s*=\s*[\'\"](.*?)[\'\"]/)?.[1],
            slots: cleanCode
              .match(/slots\s*=\s*c\((.*?)$$/)?.[1]
              ?.split(',')
              .map((s) => s.trim().replace(/[\'\"]/g, '')),
            contains: cleanCode
              .match(/contains\s*=\s*c$$(.*?)$$/)?.[1]
              ?.split(',')
              .map((c) => c.trim().replace(/[\'\"]/g, '')),
          },
          confidence: 1,
          language: 'r',
        };
      }
    }

    // Check for special values (NA, NULL, etc.)
    if (/^(NA|NULL|NaN|Inf|-Inf)$/.test(cleanCode)) {
      return {
        baseType: 'null',
        specificType: cleanCode as ExtendedType, // Cast to ExtendedType
        metadata: {
          isNA: cleanCode === 'NA',
          isNull: cleanCode === 'NULL',
          isSpecialValue: true,
        },
        confidence: 1,
        language: 'r',
      };
    }

    // Default R object
    return {
      baseType: 'object',
      specificType: 'r_object',
      metadata: {},
      confidence: 0.5,
      language: 'r',
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
      language: 'r',
    };
  }
};

/**
 * MCP Tool: Architecture Detector
 * Detects project architecture patterns, frameworks, and configurations
 */

import type { MCPToolResponse } from '../types/mcp';
import { ErrorPatterns } from './error-handling';
import { ok, runTool } from './tool-helpers';

export interface ArchitectureDetectorArgs {
  action:
    | 'detectArchitecture'
    | 'detectStateManagement'
    | 'detectStyling'
    | 'detectTesting'
    | 'detectPort'
    | 'detectPatterns';
  fileList?: string[];
  imports?: string[];
  packageName?: string;
  fileAnalyses?: Array<{
    filePath: string;
    imports?: string[];
    exports?: string[];
  }>;
}

export const architectureDetectorTool = {
  name: 'architecture_detector',
  description: 'Detect project architecture patterns, frameworks, and configurations',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'detectArchitecture',
          'detectStateManagement',
          'detectStyling',
          'detectTesting',
          'detectPort',
          'detectPatterns',
        ],
        description: 'Type of detection to perform',
      },
      fileList: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of file paths to analyze',
      },
      imports: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of import statements to analyze',
      },
      packageName: {
        type: 'string',
        description: 'Package name for port detection',
      },
      fileAnalyses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            filePath: { type: 'string' },
            imports: {
              type: 'array',
              items: { type: 'string' },
            },
            exports: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['filePath'],
        },
        description: 'Array of file analysis objects',
      },
    },
    required: ['action'],
  },

  async execute(args: ArchitectureDetectorArgs): Promise<MCPToolResponse> {
    return runTool('architecture_detector', args.action, async () => {
      const { action, fileList = [], imports = [], packageName, fileAnalyses = [] } = args;

      switch (action) {
        case 'detectArchitecture': {
          const files = fileList?.length ? fileList : fileAnalyses.map(f => f.filePath);

          const hasPages = files.some(f => f.includes('/pages/'));
          const hasApp = files.some(f => f.includes('/app/'));
          const hasApi = files.some(f => f.includes('/api/'));
          const hasComponents = files.some(f => f.includes('/components/'));
          const hasSrc = files.some(f => f.includes('/src/'));
          const hasLib = files.some(f => f.includes('/lib/'));

          let architecture = 'unknown';

          if (hasApp) {
            architecture = 'nextjs-app-router';
          } else if (hasPages) {
            architecture = 'nextjs-pages-router';
          } else if (hasApi && hasComponents) {
            architecture = 'full-stack';
          } else if (hasComponents) {
            architecture = 'frontend';
          } else if (hasSrc || hasLib) {
            architecture = 'library';
          }

          const result = {
            architecture,
            indicators: {
              hasPages,
              hasApp,
              hasApi,
              hasComponents,
              hasSrc,
              hasLib,
            },
            totalFiles: files.length,
          };

          return ok(result);
        }

        case 'detectStateManagement': {
          const allImports = imports?.length ? imports : fileAnalyses.flatMap(f => f.imports ?? []);

          let stateManagement = 'react-state'; // default

          if (allImports.some(i => i.includes('zustand'))) {
            stateManagement = 'zustand';
          } else if (allImports.some(i => i.includes('redux'))) {
            stateManagement = 'redux';
          } else if (allImports.some(i => i.includes('mobx'))) {
            stateManagement = 'mobx';
          } else if (allImports.some(i => i.includes('recoil'))) {
            stateManagement = 'recoil';
          } else if (allImports.some(i => i.includes('jotai'))) {
            stateManagement = 'jotai';
          } else if (allImports.some(i => i.includes('valtio'))) {
            stateManagement = 'valtio';
          }

          const result = {
            stateManagement,
            detectedLibraries: allImports.filter(i =>
              ['zustand', 'redux', 'mobx', 'recoil', 'jotai', 'valtio'].some(lib =>
                i.includes(lib),
              ),
            ),
            totalImports: allImports.length,
          };

          return ok(result);
        }

        case 'detectStyling': {
          const allImports = imports?.length ? imports : fileAnalyses.flatMap(f => f.imports ?? []);
          const files = fileList?.length ? fileList : fileAnalyses.map(f => f.filePath);

          let styling = 'css'; // default

          if (allImports.some(i => i.includes('@mantine/core'))) {
            styling = 'mantine';
          } else if (allImports.some(i => i.includes('styled-components'))) {
            styling = 'styled-components';
          } else if (allImports.some(i => i.includes('@emotion'))) {
            styling = 'emotion';
          } else if (allImports.some(i => i.includes('tailwind'))) {
            styling = 'tailwind';
          } else if (files.some(f => f.endsWith('.module.css'))) {
            styling = 'css-modules';
          } else if (files.some(f => f.endsWith('.scss') || f.endsWith('.sass'))) {
            styling = 'sass';
          }

          const result = {
            styling,
            indicators: {
              hasCssModules: files.some(f => f.endsWith('.module.css')),
              hasSass: files.some(f => f.endsWith('.scss') || f.endsWith('.sass')),
              hasStyledComponents: allImports.some(i => i.includes('styled-components')),
              hasTailwind: allImports.some(i => i.includes('tailwind')),
              hasMantine: allImports.some(i => i.includes('@mantine/core')),
              hasEmotion: allImports.some(i => i.includes('@emotion')),
            },
          };

          return ok(result);
        }

        case 'detectTesting': {
          const allImports = imports?.length ? imports : fileAnalyses.flatMap(f => f.imports ?? []);

          let testing = 'none'; // default

          if (allImports.some(i => i.includes('vitest'))) {
            testing = 'vitest';
          } else if (allImports.some(i => i.includes('@testing-library'))) {
            testing = 'testing-library';
          } else if (allImports.some(i => i.includes('jest'))) {
            testing = 'jest';
          } else if (allImports.some(i => i.includes('cypress'))) {
            testing = 'cypress';
          } else if (allImports.some(i => i.includes('playwright'))) {
            testing = 'playwright';
          }

          const result = {
            testing,
            detectedLibraries: allImports.filter(i =>
              ['vitest', '@testing-library', 'jest', 'cypress', 'playwright'].some(lib =>
                i.includes(lib),
              ),
            ),
          };

          return ok(result);
        }

        case 'detectPort': {
          if (!packageName) {
            throw new Error('packageName is required for detectPort');
          }

          // Based on CLAUDE.md port assignments
          const portMap: Record<string, number> = {
            webapp: 3200,
            'ai-chatbot': 3100,
            email: 3500,
            studio: 3600,
            storybook: 3700,
            docs: 3800,
            'mantine-tailwind-template': 3000,
          };

          let detectedPort = 3000; // default

          // Try to match package name
          for (const [key, port] of Object.entries(portMap)) {
            if (packageName?.includes(key)) {
              detectedPort = port;
              break;
            }
          }

          const result = {
            packageName,
            detectedPort,
            portMap,
            matched: Object.keys(portMap).find(key => packageName?.includes(key)) ?? null,
          };

          return ok(result);
        }

        case 'detectPatterns': {
          // Comprehensive pattern detection combining all methods
          const files = fileList?.length ? fileList : fileAnalyses.map(f => f.filePath);
          const allImports = imports?.length ? imports : fileAnalyses.flatMap(f => f.imports ?? []);

          // Run all detections in parallel to avoid memory leak from recursive calls
          const [architectureResult, stateResult, stylingResult, testingResult] = await Promise.all(
            [
              architectureDetectorTool.execute({
                action: 'detectArchitecture',
                fileList: files,
                fileAnalyses,
              }),
              architectureDetectorTool.execute({
                action: 'detectStateManagement',
                imports: allImports,
                fileAnalyses,
              }),
              architectureDetectorTool.execute({
                action: 'detectStyling',
                imports: allImports,
                fileList: files,
                fileAnalyses,
              }),
              architectureDetectorTool.execute({
                action: 'detectTesting',
                imports: allImports,
                fileAnalyses,
              }),
            ],
          );

          const result = {
            architecture: safeJsonParse(architectureResult.content[0].text, 'architecture'),
            stateManagement: safeJsonParse(stateResult.content[0].text, 'stateManagement'),
            styling: safeJsonParse(stylingResult.content[0].text, 'styling'),
            testing: safeJsonParse(testingResult.content[0].text, 'testing'),
            summary: {
              totalFiles: files.length,
              totalImports: allImports.length,
              analyzedAt: Date.now(),
            },
          };

          return ok(result);
        }

        default:
          throw ErrorPatterns.unknownAction(action, [
            'detectArchitecture',
            'detectStateManagement',
            'detectStyling',
            'detectTesting',
            'detectPort',
            'detectPatterns',
          ]);
      }
    });
  },
};

// Safe JSON parsing function to prevent remote code execution
function safeJsonParse(jsonString: string, context: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(jsonString);
    // Additional safety check - ensure it's an object
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { error: `Invalid JSON structure for ${context}`, receivedType: typeof parsed };
  } catch (error) {
    return {
      error: `JSON parsing failed for ${context}`,
      message: error instanceof Error ? error.message : 'Unknown parsing error',
      originalInput: jsonString?.substring(0, 100) + (jsonString?.length > 100 ? '...' : ''),
    };
  }
}

/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * Pattern Detection Tool for Code Quality Analysis
 *
 * Detects architectural patterns in codebase including framework detection,
 * state management patterns, styling approaches, and testing frameworks.
 */

import { tool, type Tool } from 'ai';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { mcpClient } from '../mcp-client';
import type { Pattern } from '../types';

// Input schema for pattern detection
const patternDetectionInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  paths: z.array(z.string()).describe('File paths to analyze for patterns'),
  analysisType: z
    .enum(['framework', 'state', 'styling', 'testing', 'all'])
    .optional()
    .default('all')
    .describe('Type of patterns to detect'),
});

// Pattern detection result
interface PatternDetectionResult {
  sessionId: string;
  patterns: Pattern[];
  architecture: {
    framework: string | null;
    stateManagement: string[];
    styling: string[];
    testing: string[];
    routing: string | null;
    bundler: string | null;
  };
  confidence: number;
  evidence: string[];
}

// Framework detection patterns
const frameworkPatterns = {
  React: [
    /import.*React.*from ['"]react['"]/,
    /import.*\{.*useState.*\}.*from ['"]react['"]/,
    /export.*React\.FC/,
    /\.jsx?$/,
    /\.tsx$/,
  ],
  'Next.js': [
    /from ['"]next\/.*['"]/,
    /import.*\{.*NextPage.*\}.*from ['"]next['"]/,
    /getServerSideProps/,
    /getStaticProps/,
    /\/app\/.*page\.[jt]sx?$/,
    /\/pages\/.*\.[jt]sx?$/,
  ],
  Vue: [/import.*Vue.*from ['"]vue['"]/, /<template>/, /<script.*setup/, /\.vue$/],
  Angular: [
    /from ['"]@angular\/.*['"]/,
    /@Component/,
    /@Injectable/,
    /\.component\.ts$/,
    /\.service\.ts$/,
  ],
  Svelte: [/import.*from ['"]svelte.*['"]/, /<script>/, /\.svelte$/],
};

// State management patterns
const statePatterns = {
  Redux: [
    /from ['"]@reduxjs\/toolkit['"]/,
    /from ['"]redux['"]/,
    /createSlice/,
    /configureStore/,
    /useSelector/,
    /useDispatch/,
  ],
  Zustand: [/from ['"]zustand['"]/, /create.*\(/, /useStore/],
  Jotai: [/from ['"]jotai['"]/, /atom\(/, /useAtom/],
  Recoil: [/from ['"]recoil['"]/, /atom\(/, /useRecoilState/],
  MobX: [/from ['"]mobx['"]/, /@observable/, /@action/],
  'Context API': [/createContext/, /useContext/, /\.Provider/],
};

// Styling patterns
const stylingPatterns = {
  'Tailwind CSS': [
    /from ['"]tailwindcss['"]/,
    /@tailwind/,
    /className.*=.*['"][^'"]*(?:flex|grid|bg-|text-|p-|m-|w-|h-)/,
  ],
  'Styled Components': [/from ['"]styled-components['"]/, /styled\./, /css`/],
  Emotion: [/from ['"]@emotion\/.*['"]/, /@emotion\/react/, /css\(/],
  'CSS Modules': [/\.module\.css/, /styles\./],
  'Sass/SCSS': [/\.scss$/, /\.sass$/, /@import.*\.scss/],
  Less: [/\.less$/, /@import.*\.less/],
};

// Testing patterns
const testingPatterns = {
  Jest: [
    /from ['"]jest['"]/,
    /describe\(/,
    /test\(/,
    /it\(/,
    /expect\(/,
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
  ],
  Vitest: [/from ['"]vitest['"]/, /import.*\{.*test.*\}.*from ['"]vitest['"]/, /vitest\.config/],
  'React Testing Library': [
    /from ['"]@testing-library\/react['"]/,
    /render\(/,
    /screen\./,
    /fireEvent\./,
  ],
  Cypress: [/from ['"]cypress['"]/, /cy\./, /cypress\.config/],
  Playwright: [/from ['"]@playwright\/test['"]/, /test\(/, /expect.*toHave/, /playwright\.config/],
};

// Routing patterns
const routingPatterns = {
  'React Router': [
    /from ['"]react-router['"]/,
    /from ['"]react-router-dom['"]/,
    /<Route/,
    /<Router/,
    /useNavigate/,
    /useParams/,
  ],
  'Next.js Router': [
    /from ['"]next\/router['"]/,
    /from ['"]next\/navigation['"]/,
    /useRouter/,
    /usePathname/,
  ],
  'Vue Router': [/from ['"]vue-router['"]/, /createRouter/, /useRoute/],
};

// Bundler patterns
const bundlerPatterns = {
  Webpack: [/webpack\.config/, /from ['"]webpack['"]/],
  Vite: [/vite\.config/, /from ['"]vite['"]/],
  Rollup: [/rollup\.config/, /from ['"]rollup['"]/],
  Parcel: [/\.parcelrc/, /from ['"]parcel['"]/],
  Turbopack: [/turbo\.json/, /from ['"]turbopack['"]/],
};

// Analyze file content for patterns
async function analyzeFileContent(
  filePath: string,
  packagePath: string,
): Promise<{
  frameworks: string[];
  stateManagement: string[];
  styling: string[];
  testing: string[];
  routing: string[];
  bundlers: string[];
  evidence: string[];
}> {
  try {
    const fullPath = join(packagePath, filePath);
    const content = await readFile(fullPath, 'utf-8');

    const detected = {
      frameworks: [] as string[],
      stateManagement: [] as string[],
      styling: [] as string[],
      testing: [] as string[],
      routing: [] as string[],
      bundlers: [] as string[],
      evidence: [] as string[],
    };

    // Check framework patterns
    for (const [framework, patterns] of Object.entries(frameworkPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content) || pattern.test(filePath)) {
          detected.frameworks.push(framework);
          detected.evidence.push(`${framework}: Found in ${filePath}`);
          break;
        }
      }
    }

    // Check state management patterns
    for (const [state, patterns] of Object.entries(statePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          detected.stateManagement.push(state);
          detected.evidence.push(`${state}: Found in ${filePath}`);
          break;
        }
      }
    }

    // Check styling patterns
    for (const [styling, patterns] of Object.entries(stylingPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content) || pattern.test(filePath)) {
          detected.styling.push(styling);
          detected.evidence.push(`${styling}: Found in ${filePath}`);
          break;
        }
      }
    }

    // Check testing patterns
    for (const [testing, patterns] of Object.entries(testingPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content) || pattern.test(filePath)) {
          detected.testing.push(testing);
          detected.evidence.push(`${testing}: Found in ${filePath}`);
          break;
        }
      }
    }

    // Check routing patterns
    for (const [routing, patterns] of Object.entries(routingPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          detected.routing.push(routing);
          detected.evidence.push(`${routing}: Found in ${filePath}`);
          break;
        }
      }
    }

    // Check bundler patterns
    for (const [bundler, patterns] of Object.entries(bundlerPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content) || pattern.test(filePath)) {
          detected.bundlers.push(bundler);
          detected.evidence.push(`${bundler}: Found in ${filePath}`);
          break;
        }
      }
    }

    return detected;
  } catch (error) {
    return {
      frameworks: [],
      stateManagement: [],
      styling: [],
      testing: [],
      routing: [],
      bundlers: [],
      evidence: [`Error analyzing ${filePath}: ${(error as Error).message}`],
    };
  }
}

// Determine primary architecture from detected patterns
function determineArchitecture(allDetected: {
  frameworks: string[];
  stateManagement: string[];
  styling: string[];
  testing: string[];
  routing: string[];
  bundlers: string[];
  evidence: string[];
}): {
  framework: string | null;
  stateManagement: string[];
  styling: string[];
  testing: string[];
  routing: string | null;
  bundler: string | null;
} {
  // Count occurrences to determine primary patterns
  const frameworkCounts = allDetected.frameworks.reduce(
    (acc, f) => {
      acc[f] = (acc[f] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const routingCounts = allDetected.routing.reduce(
    (acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const bundlerCounts = allDetected.bundlers.reduce(
    (acc, b) => {
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get primary framework (most common)
  const primaryFramework =
    Object.entries(frameworkCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  // Get primary routing
  const primaryRouting =
    Object.entries(routingCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  // Get primary bundler
  const primaryBundler =
    Object.entries(bundlerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  // Get unique state management, styling, and testing approaches
  const uniqueState = [...new Set(allDetected.stateManagement)];
  const uniqueStyling = [...new Set(allDetected.styling)];
  const uniqueTesting = [...new Set(allDetected.testing)];

  return {
    framework: primaryFramework,
    stateManagement: uniqueState,
    styling: uniqueStyling,
    testing: uniqueTesting,
    routing: primaryRouting,
    bundler: primaryBundler,
  };
}

// Calculate confidence score
function calculateConfidence(
  architecture: ReturnType<typeof determineArchitecture>,
  evidenceCount: number,
  totalFiles: number,
): number {
  let confidence = 0;

  // Base confidence from detected patterns
  if (architecture.framework) confidence += 30;
  if (architecture.stateManagement.length > 0) confidence += 20;
  if (architecture.styling.length > 0) confidence += 20;
  if (architecture.testing.length > 0) confidence += 15;
  if (architecture.routing) confidence += 10;
  if (architecture.bundler) confidence += 5;

  // Boost confidence based on evidence coverage
  const coverageRatio = Math.min(evidenceCount / totalFiles, 1);
  confidence *= 0.5 + coverageRatio * 0.5;

  return Math.min(Math.round(confidence), 100);
}

// Main pattern detection tool
export const patternDetectionTool = tool({
  description:
    'Detect architectural patterns in codebase including framework detection, state management patterns, styling approaches, and testing frameworks.',

  inputSchema: patternDetectionInputSchema,

  execute: async (
    { sessionId, paths, analysisType: _analysisType = 'all' }: any,
    _toolOptions: any = { toolCallId: 'pattern-detection', messages: [] },
  ) => {
    try {
      // Get package path from session
      const session = await mcpClient.getSession(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const packagePath = session.worktreePath || session.workingDirectory;

      // Analyze all files for patterns
      const allDetected = {
        frameworks: [] as string[],
        stateManagement: [] as string[],
        styling: [] as string[],
        testing: [] as string[],
        routing: [] as string[],
        bundlers: [] as string[],
        evidence: [] as string[],
      };

      // Process files in parallel
      const analysisPromises = paths.map((path: string) => analyzeFileContent(path, packagePath));
      const results = await Promise.all(analysisPromises);

      // Aggregate results
      for (const result of results) {
        allDetected.frameworks.push(...result.frameworks);
        allDetected.stateManagement.push(...result.stateManagement);
        allDetected.styling.push(...result.styling);
        allDetected.testing.push(...result.testing);
        allDetected.routing.push(...result.routing);
        allDetected.bundlers.push(...result.bundlers);
        allDetected.evidence.push(...result.evidence);
      }

      // Determine primary architecture
      const architecture = determineArchitecture(allDetected);

      // Calculate confidence
      const confidence = calculateConfidence(
        architecture,
        allDetected.evidence.length,
        paths.length,
      );

      // Create pattern objects
      const patterns: Pattern[] = [];

      if (architecture.framework) {
        patterns.push({
          type: 'framework',
          name: architecture.framework,
          confidence: confidence,
          evidence: allDetected.evidence.filter(
            e => architecture.framework && e.includes(architecture.framework),
          ),
        });
      }

      architecture.stateManagement.forEach(state => {
        patterns.push({
          type: 'state',
          name: state,
          confidence: confidence * 0.8,
          evidence: allDetected.evidence.filter(e => e.includes(state)),
        });
      });

      architecture.styling.forEach(styling => {
        patterns.push({
          type: 'styling',
          name: styling,
          confidence: confidence * 0.7,
          evidence: allDetected.evidence.filter(e => e.includes(styling)),
        });
      });

      architecture.testing.forEach(testing => {
        patterns.push({
          type: 'testing',
          name: testing,
          confidence: confidence * 0.6,
          evidence: allDetected.evidence.filter(e => e.includes(testing)),
        });
      });

      const result: PatternDetectionResult = {
        sessionId,
        patterns,
        architecture,
        confidence,
        evidence: allDetected.evidence,
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'pattern-detection',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'pattern-detection',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content
  toModelOutput: (result: PatternDetectionResult) => [
    {
      type: 'text' as const,
      text:
        `🏗️ Architecture Analysis Results:\n` +
        `📊 Confidence: ${result.confidence}%\n` +
        `🖼️ Framework: ${result.architecture.framework || 'None detected'}\n` +
        `🔄 State Management: ${result.architecture.stateManagement.join(', ') || 'None'}\n` +
        `🎨 Styling: ${result.architecture.styling.join(', ') || 'None'}\n` +
        `🧪 Testing: ${result.architecture.testing.join(', ') || 'None'}\n` +
        `🛣️ Routing: ${result.architecture.routing || 'None'}\n` +
        `📦 Bundler: ${result.architecture.bundler || 'None'}\n` +
        `🔍 Patterns detected: ${result.patterns.length}\n` +
        `📝 Evidence items: ${result.evidence.length}`,
    },
  ],
} as any) as Tool;

export type { PatternDetectionResult };

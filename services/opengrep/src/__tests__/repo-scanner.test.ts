import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepoScanner } from '../repo-scanner.js';

// Mock the server module
vi.mock('../server.js', () => ({
  createOpenGrepLocalClient: vi.fn(() => ({
    scan: vi.fn(),
    search: vi.fn(),
    getRules: vi.fn(),
    validateRule: vi.fn(),
  })),
}));

// Mock the config module
vi.mock('../config.js', () => ({
  getOpenGrepConfig: vi.fn(() => ({
    OPENGREP_API_KEY: undefined,
    OPENGREP_BASE_URL: 'https://semgrep.dev/api',
    OPENGREP_TIMEOUT: 30000,
    OPENGREP_MAX_RETRIES: 3,
    SEMGREP_PATH: 'semgrep',
  })),
  defaultRuleSets: {
    security: ['p/security-audit'],
    javascript: ['p/javascript'],
    typescript: ['p/typescript'],
    python: ['p/python'],
    general: ['p/code-quality'],
  },
  repoScanConfig: {
    excludePaths: ['node_modules/**', '.git/**'],
    includePaths: ['apps/**', 'packages/**'],
    timeout: 300000,
  },
}));

// Mock fs promises
vi.mock('fs', () => ({
  promises: {
    stat: vi.fn(),
    writeFile: vi.fn(),
  },
}));

describe('RepoScanner', () => {
  let scanner: RepoScanner;

  beforeEach(() => {
    vi.clearAllMocks();
    scanner = new RepoScanner();
  });

  it('should create a RepoScanner instance', () => {
    expect(scanner).toBeInstanceOf(RepoScanner);
  });

  it('should have scanRepository method', () => {
    expect(typeof scanner.scanRepository).toBe('function');
  });

  it('should have searchInRepository method', () => {
    expect(typeof scanner.searchInRepository).toBe('function');
  });

  describe('scanRepository', () => {
    it('should return a scan result with summary', async () => {
      const mockClient = {
        scan: vi.fn().mockResolvedValue({
          results: [
            {
              file: 'test.js',
              line: 1,
              column: 1,
              ruleId: 'test-rule',
              message: 'Test issue',
              severity: 'warning',
            },
          ],
          errors: [],
          warnings: [],
          stats: {
            filesScanned: 1,
            rulesRun: 1,
            scanTime: 100,
          },
        }),
      };

      // Mock the client
      const { createOpenGrepLocalClient } = await import('../server.js');
      vi.mocked(createOpenGrepLocalClient).mockReturnValue(mockClient as any);

      // Mock fs.stat to return directory
      const fs = await import('fs');
      vi.mocked(fs.promises.stat).mockResolvedValue({ isDirectory: () => true } as any);

      const result = await scanner.scanRepository({
        rootPath: '/test',
        ruleSets: ['javascript'],
        verbose: false,
      });

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('results');
      expect(result.summary.totalIssues).toBe(1);
      expect(result.summary.warningCount).toBe(1);
    });
  });

  describe('searchInRepository', () => {
    it('should search for patterns and return results', async () => {
      const mockClient = {
        search: vi.fn().mockResolvedValue({
          results: [
            {
              file: 'test.js',
              line: 5,
              column: 10,
              match: 'console.log("test")',
            },
          ],
          totalCount: 1,
          hasMore: false,
          searchTime: 50,
          query: {
            pattern: 'console.log',
            maxResults: 100,
          },
        }),
      };

      // Mock the client
      const { createOpenGrepLocalClient } = await import('../server.js');
      vi.mocked(createOpenGrepLocalClient).mockReturnValue(mockClient as any);

      // Mock fs.stat to return directory
      const fs = await import('fs');
      vi.mocked(fs.promises.stat).mockResolvedValue({ isDirectory: () => true } as any);

      const results = await scanner.searchInRepository(['console.log'], {
        rootPath: '/test',
        verbose: false,
      });

      expect(results).toHaveLength(1);
      expect(results[0].results).toHaveLength(1);
      expect(results[0].results[0].match).toBe('console.log("test")');
    });
  });
});

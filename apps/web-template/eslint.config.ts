import baseConfig from '@repo/eslint-config/next';

// Add explicit ignores to improve performance and prevent parent directory scanning
const config = [
  {
    // Only process files in specific directories to avoid scanning parent directories
    files: ['app/**/*.{js,jsx,ts,tsx}', 'src/**/*.{js,jsx,ts,tsx}', '*.{js,jsx,ts,tsx}'],
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.min.js',
      '**/generated/**',
      'tsconfig.tsbuildinfo',
      '.turbo/**',
      // Add more specific ignores to prevent scanning too many files
      'docs/**',
      'e2e/**',
      'eslint-results.json',
      '**/*.json',
      '**/*.md',
      '**/*.mdx',
      '**/*.css',
      '**/*.scss',
      // Exclude specific problem directories
      'src/components/ui/ListingImageGallery/**',
    ],
  },
  ...baseConfig,
];

export default config;

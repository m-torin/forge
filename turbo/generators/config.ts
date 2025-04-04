import type { PlopTypes } from '@turbo/gen';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('init', {
    description: 'Generate a new package for the Monorepo',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message:
          'What is the name of the package? (You can skip the `@repo/` prefix)',
      },
    ],
    actions: [
      (answers) => {
        if (
          'name' in answers &&
          typeof answers.name === 'string' &&
          answers.name.startsWith('@repo/')
        ) {
          answers.name = answers.name.replace('@repo/', '');
        }
        return 'Config sanitized';
      },
      // Create package.json
      {
        type: 'add',
        path: 'packages/{{ name }}/package.json',
        templateFile: 'templates/package.json.hbs',
      },
      // Create tsconfig.json
      {
        type: 'add',
        path: 'packages/{{ name }}/tsconfig.json',
        templateFile: 'templates/tsconfig.json.hbs',
      },
      // Create eslint.config.ts
      {
        type: 'add',
        path: 'packages/{{ name }}/eslint.config.ts',
        templateFile: 'templates/eslint.config.ts.hbs',
      },
      // Create src directory and index.ts
      {
        type: 'add',
        path: 'packages/{{ name }}/src/index.ts',
        templateFile: 'templates/index.ts.hbs',
      },
      // Create __tests__ directory and index.test.ts
      {
        type: 'add',
        path: 'packages/{{ name }}/__tests__/index.test.ts',
        templateFile: 'templates/index.test.ts.hbs',
      },
      // Log completion message
      (answers) => {
        const name =
          typeof answers.name === 'string' ? answers.name : 'unknown';
        return `Package @repo/${name} created successfully! Verify it meets all requirements in .clinerules/monorepo/package-generator.md`;
      },
    ],
  });
}

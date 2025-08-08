/**
 * Documentation Generator Tool
 *
 * Automatically generates comprehensive documentation from code analysis.
 * Supports API docs, component docs, architecture diagrams, and more.
 *
 * Security Note: This is a development tool that intentionally reads/writes files
 * based on user-provided paths. All filesystem operations are within project context.
 */

/* eslint-disable security/detect-non-literal-fs-filename */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { logInfo } from '@repo/observability';
import { tool } from 'ai';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import { z } from 'zod';
import { createAsyncLogger } from '../mcp-client';
import { BoundedCache, processInBatches } from '../utils';

const inputSchema = z.object({
  path: z.string().describe('Path to generate documentation for'),
  outputDir: z.string().default('./docs').describe('Output directory for documentation'),
  docTypes: z
    .array(z.enum(['api', 'components', 'architecture', 'readme', 'changelog']))
    .default(['api', 'readme']),
  format: z.enum(['markdown', 'mdx', 'json', 'html']).default('markdown'),
  includeExamples: z.boolean().default(true),
  includeDiagrams: z.boolean().default(true),
  maxFiles: z.number().optional().default(200),
});

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: Array<{
    status: number;
    description: string;
    schema?: any;
  }>;
  examples?: Array<{
    title: string;
    request: any;
    response: any;
  }>;
}

interface ComponentDoc {
  name: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
  }>;
  events?: Array<{
    name: string;
    payload: string;
    description: string;
  }>;
  slots?: Array<{
    name: string;
    description: string;
  }>;
  examples?: string[];
}

interface DocumentationResult {
  api?: {
    endpoints: APIEndpoint[];
    baseUrl?: string;
    authentication?: string;
  };
  components?: {
    components: ComponentDoc[];
    framework: string;
  };
  architecture?: {
    overview: string;
    diagrams: string[];
    modules: Array<{
      name: string;
      description: string;
      dependencies: string[];
    }>;
  };
  readme?: {
    content: string;
    sections: string[];
  };
  changelog?: {
    entries: Array<{
      version: string;
      date: string;
      changes: string[];
    }>;
  };
  filesGenerated: string[];
}

class DocumentationGenerator {
  private cache = new BoundedCache({ maxSize: 50 });
  private logger = createAsyncLogger('documentation-generator');

  async generate(options: z.infer<typeof inputSchema>): Promise<DocumentationResult> {
    await this.logger('Starting documentation generation', {
      path: options.path,
      types: options.docTypes,
    });

    const result: DocumentationResult = {
      filesGenerated: [],
    };

    // Validate and ensure output directory exists (development tool - paths are user-controlled)
    const path = await import('path');
    const resolvedOutputDir = path.resolve(options.outputDir);
    await mkdir(resolvedOutputDir, { recursive: true });

    // Generate requested documentation types
    for (const docType of options.docTypes) {
      switch (docType) {
        case 'api':
          result.api = await this.generateAPIDocs(options);
          break;
        case 'components':
          result.components = await this.generateComponentDocs(options);
          break;
        case 'architecture':
          result.architecture = await this.generateArchitectureDocs(options);
          break;
        case 'readme':
          result.readme = await this.generateReadme(options);
          break;
        case 'changelog':
          result.changelog = await this.generateChangelog(options);
          break;
      }
    }

    // Write documentation files
    if (result.api) {
      const apiDoc = this.formatAPIDocs(result.api, options.format);
      const apiPath = path.join(resolvedOutputDir, `api.${this.getFileExtension(options.format)}`);
      await writeFile(apiPath, apiDoc);
      result.filesGenerated.push(apiPath);
    }

    if (result.components) {
      const componentDoc = this.formatComponentDocs(result.components, options.format);
      const componentPath = path.join(
        resolvedOutputDir,
        `components.${this.getFileExtension(options.format)}`,
      );
      await writeFile(componentPath, componentDoc);
      result.filesGenerated.push(componentPath);
    }

    if (result.architecture) {
      const archDoc = this.formatArchitectureDocs(result.architecture, options.format);
      const archPath = path.join(
        resolvedOutputDir,
        `architecture.${this.getFileExtension(options.format)}`,
      );
      await writeFile(archPath, archDoc);
      result.filesGenerated.push(archPath);
    }

    if (result.readme) {
      const readmePath = path.join(resolvedOutputDir, 'README.md');
      await writeFile(readmePath, result.readme.content);
      result.filesGenerated.push(readmePath);
    }

    if (result.changelog) {
      const changelogContent = this.formatChangelog(result.changelog);
      const changelogPath = path.join(resolvedOutputDir, 'CHANGELOG.md');
      await writeFile(changelogPath, changelogContent);
      result.filesGenerated.push(changelogPath);
    }

    await this.logger('Documentation generation completed', {
      filesGenerated: result.filesGenerated.length,
    });

    return result;
  }

  private async generateAPIDocs(options: z.infer<typeof inputSchema>): Promise<any> {
    const endpoints: APIEndpoint[] = [];

    // Find API route files (Next.js app router pattern)
    const apiFiles = await glob('**/app/**/route.{js,ts}', {
      cwd: options.path,
      absolute: true,
    });

    // Also check pages/api for older Next.js projects
    const pagesApiFiles = await glob('**/pages/api/**/*.{js,ts}', {
      cwd: options.path,
      absolute: true,
    });

    const allApiFiles = [...apiFiles, ...pagesApiFiles].slice(0, options.maxFiles);

    await processInBatches(
      allApiFiles,
      async file => {
        const endpoint = await this.parseAPIEndpoint(file);
        if (endpoint) {
          endpoints.push(endpoint);
        }
      },
      { batchSize: 20 },
    );

    // Try to detect base URL from environment or package.json
    let baseUrl = '';
    try {
      const packageJson = JSON.parse(await readFile(`${options.path}/package.json`, 'utf8'));
      baseUrl = packageJson.homepage || 'http://localhost:3000';
    } catch {}

    return {
      endpoints: endpoints.sort((a, b) => a.path.localeCompare(b.path)),
      baseUrl,
      authentication: this.detectAuthMethod(endpoints),
    };
  }

  private async parseAPIEndpoint(file: string): Promise<APIEndpoint | null> {
    try {
      const content = await readFile(file, 'utf8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      // Extract route from file path
      const routePath = this.extractRoutePath(file);

      // Find exported HTTP method handlers
      const methods: string[] = [];
      const endpoint: APIEndpoint = {
        method: '',
        path: routePath,
        description: '',
        parameters: [],
        responses: [],
      };

      traverse(ast, {
        ExportNamedDeclaration(path) {
          if (path.node.declaration?.type === 'FunctionDeclaration') {
            const funcName = path.node.declaration.id?.name;
            if (funcName && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(funcName)) {
              methods.push(funcName);
              endpoint.method = funcName;

              // Extract JSDoc comment
              const comment = (this as any).extractJSDoc(path.node);
              if (comment) {
                endpoint.description = comment.description;
                endpoint.parameters = comment.parameters;
              }
            }
          }
        },

        // For export async function GET() pattern
        ExportDefaultDeclaration(path) {
          if (path.node.declaration.type === 'FunctionDeclaration') {
            const funcName = path.node.declaration.id?.name;
            if (funcName && ['handler', 'default'].includes(funcName)) {
              // Check for req.method handling
              endpoint.method = 'ALL';
            }
          }
        },
      });

      if (methods.length === 0) return null;

      // Add common responses
      endpoint.responses = [
        { status: 200, description: 'Success' },
        { status: 400, description: 'Bad Request' },
        { status: 500, description: 'Internal Server Error' },
      ];

      return endpoint;
    } catch (error) {
      await this.logger('Error parsing API endpoint', { file, error });
      return null;
    }
  }

  private async generateComponentDocs(options: z.infer<typeof inputSchema>): Promise<any> {
    const components: ComponentDoc[] = [];

    // Find component files
    const componentFiles = await glob('**/components/**/*.{jsx,tsx}', {
      cwd: options.path,
      absolute: true,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
    });

    const framework = await this.detectUIFramework(options.path);

    await processInBatches(
      componentFiles.slice(0, options.maxFiles),
      async file => {
        const component = await this.parseComponent(file, framework, options);
        if (component) {
          components.push(component);
        }
      },
      { batchSize: 20 },
    );

    return {
      components: components.sort((a, b) => a.name.localeCompare(b.name)),
      framework,
    };
  }

  private async parseComponent(
    file: string,
    framework: string,
    options?: z.infer<typeof inputSchema>,
  ): Promise<ComponentDoc | null> {
    try {
      const content = await readFile(file, 'utf8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      let componentName = '';
      const props: ComponentDoc['props'] = [];

      traverse(ast, {
        // Find React component
        FunctionDeclaration(path) {
          if (path.node.id && /^[A-Z]/.test(path.node.id.name)) {
            componentName = path.node.id.name;

            // Extract props from parameters
            if (path.node.params[0]?.type === 'ObjectPattern') {
              const propsParam = path.node.params[0];
              propsParam.properties.forEach((prop: any) => {
                if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                  props.push({
                    name: prop.key.name,
                    type: 'any', // Would need TypeScript AST for proper types
                    required: !prop.value.optional,
                    description: '',
                  });
                }
              });
            }
          }
        },

        // Find TypeScript interface for props
        TSInterfaceDeclaration(path) {
          if (path.node.id.name.endsWith('Props')) {
            path.node.body.body.forEach((member: any) => {
              if (member.type === 'TSPropertySignature' && member.key.type === 'Identifier') {
                const existing = props.find(p => p.name === member.key.name);
                if (existing) {
                  existing.type = (this as any).getTSType(member.typeAnnotation);
                  existing.required = !member.optional;
                } else {
                  props.push({
                    name: member.key.name,
                    type: (this as any).getTSType(member.typeAnnotation),
                    required: !member.optional,
                    description: '',
                  });
                }
              }
            });
          }
        },
      });

      if (!componentName) return null;

      return {
        name: componentName,
        description: `Component defined in ${file.split('/').slice(-2).join('/')}`,
        props,
        examples: options?.includeExamples
          ? await this.findComponentExamples(componentName, options.path)
          : undefined,
      };
    } catch (error) {
      await this.logger('Error parsing component', { file, error });
      return null;
    }
  }

  private async generateArchitectureDocs(options: z.infer<typeof inputSchema>): Promise<any> {
    const modules: any[] = [];
    const diagrams: string[] = [];

    // Analyze directory structure
    const srcDirs = await glob('**/src/*/', {
      cwd: options.path,
    });

    // Group by top-level modules
    const moduleMap = new Map<string, string[]>();

    for (const dir of srcDirs) {
      const parts = dir.split('/');
      const module = parts[parts.indexOf('src') + 1];
      if (module) {
        if (!moduleMap.has(module)) {
          moduleMap.set(module, []);
        }
        const moduleEntries = moduleMap.get(module);
        if (moduleEntries) {
          moduleEntries.push(dir);
        }
      }
    }

    // Create module documentation
    for (const [name, dirs] of moduleMap) {
      modules.push({
        name,
        description: `Module containing ${dirs.length} subdirectories`,
        dependencies: await this.findModuleDependencies(name, options.path),
      });
    }

    // Generate architecture diagram
    if (options.includeDiagrams) {
      diagrams.push(this.generateModuleDiagram(modules));
    }

    return {
      overview: this.generateArchitectureOverview(modules),
      diagrams,
      modules,
    };
  }

  private async generateReadme(options: z.infer<typeof inputSchema>): Promise<any> {
    const sections: string[] = [];
    let content = '# Project Documentation\n\n';

    // Try to read existing README for project name/description
    try {
      const existingReadme = await readFile(`${options.path}/README.md`, 'utf8');
      const titleMatch = existingReadme.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        content = `# ${titleMatch[1]}\n\n`;
      }
    } catch {}

    // Add description from package.json
    try {
      const packageJson = JSON.parse(await readFile(`${options.path}/package.json`, 'utf8'));
      if (packageJson.description) {
        content += `${packageJson.description}\n\n`;
      }

      // Installation section
      sections.push('Installation');
      content += '## Installation\n\n```bash\n';
      content += packageJson.name ? `npm install ${packageJson.name}\n` : 'npm install\n';
      content += '```\n\n';

      // Usage section
      sections.push('Usage');
      content += '## Usage\n\n';

      // Add basic usage based on main/exports
      if (packageJson.main || packageJson.exports) {
        content += '```javascript\n';
        content += `import { } from '${packageJson.name}';\n\n`;
        content += '// Example usage\n';
        content += '```\n\n';
      }

      // Scripts section
      if (packageJson.scripts) {
        sections.push('Scripts');
        content += '## Available Scripts\n\n';
        for (const [script, command] of Object.entries(packageJson.scripts)) {
          content += `- \`npm run ${script}\`: ${this.describeScript(script, command as string)}\n`;
        }
        content += '\n';
      }

      // Dependencies section
      if (packageJson.dependencies) {
        sections.push('Dependencies');
        content += '## Dependencies\n\n';
        const deps = Object.keys(packageJson.dependencies);
        content += `This project uses ${deps.length} dependencies including:\n`;
        content += deps
          .slice(0, 10)
          .map(d => `- ${d}`)
          .join('\n');
        if (deps.length > 10) {
          content += `\n- ... and ${deps.length - 10} more`;
        }
        content += '\n\n';
      }
    } catch {}

    // Configuration section
    sections.push('Configuration');
    content += '## Configuration\n\n';
    content += 'See `.env.example` for required environment variables.\n\n';

    // License section
    sections.push('License');
    content += '## License\n\n';
    try {
      const packageJson = JSON.parse(await readFile(`${options.path}/package.json`, 'utf8'));
      content += packageJson.license || 'MIT';
    } catch {
      content += 'MIT';
    }
    content += '\n';

    return {
      content,
      sections,
    };
  }

  private async generateChangelog(options: z.infer<typeof inputSchema>): Promise<any> {
    const entries: any[] = [];

    // Try to parse existing CHANGELOG
    try {
      const changelog = await readFile(`${options.path}/CHANGELOG.md`, 'utf8');
      // Simple parsing - in production would use a proper parser
      const versionMatches = changelog.match(/##\s+\[?(\d+\.\d+\.\d+)\]?.*?(\d{4}-\d{2}-\d{2})/g);

      if (versionMatches) {
        for (const match of versionMatches.slice(0, 10)) {
          const [, version, date] = match.match(/(\d+\.\d+\.\d+).*?(\d{4}-\d{2}-\d{2})/) || [];
          if (version && date) {
            entries.push({
              version,
              date,
              changes: ['See CHANGELOG.md for details'],
            });
          }
        }
      }
    } catch {
      // Generate from git tags if no CHANGELOG exists
      entries.push({
        version: '1.0.0',
        date: new Date().toISOString().split('T')[0],
        changes: ['Initial release'],
      });
    }

    return { entries };
  }

  // Helper methods
  private extractRoutePath(file: string): string {
    // Convert file path to API route
    // app/api/users/[id]/route.ts -> /api/users/:id
    let route = file;

    if (route.includes('/app/')) {
      route = route.split('/app/')[1];
    } else if (route.includes('/pages/api/')) {
      route = route.split('/pages/api/')[1];
    }

    route = route.replace(/\/route\.(js|ts)$/, '');
    route = route.replace(/\.(js|ts)$/, '');
    route = route.replace(/\[([^\]]+)\]/g, ':$1');

    return '/' + route;
  }

  private extractJSDoc(node: any): any {
    // Simplified JSDoc extraction
    const leadingComments = node.leadingComments || [];
    for (const comment of leadingComments) {
      if (comment.type === 'CommentBlock' && comment.value.startsWith('*')) {
        const lines = comment.value.split('\n');
        const description =
          lines
            .find((l: string) => !l.includes('@'))
            ?.trim()
            .replace(/^\*\s*/, '') || '';
        const parameters: any[] = [];

        lines.forEach((line: string) => {
          const paramMatch = line.match(/@param\s+\{([^}]+)\}\s+(\w+)\s+-?\s*(.*)$/);
          if (paramMatch) {
            parameters.push({
              name: paramMatch[2],
              type: paramMatch[1],
              required: !paramMatch[1].includes('?'),
              description: paramMatch[3],
            });
          }
        });

        return { description, inputSchema };
      }
    }
    return null;
  }

  private detectAuthMethod(endpoints: APIEndpoint[]): string {
    // Simple auth detection based on common patterns
    const authHeaders = ['authorization', 'x-api-key', 'x-auth-token'];
    const hasAuth = endpoints.some(e =>
      e.parameters.some(p => authHeaders.includes(p.name.toLowerCase())),
    );

    if (hasAuth) {
      return 'Bearer token or API key required in headers';
    }

    return 'No authentication detected';
  }

  private async detectUIFramework(path: string): Promise<string> {
    try {
      const packageJson = JSON.parse(await readFile(`${path}/package.json`, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.react) return 'react';
      if (deps.vue) return 'vue';
      if (deps.svelte) return 'svelte';
    } catch {}

    return 'unknown';
  }

  private getTSType(typeAnnotation: any): string {
    if (!typeAnnotation || !typeAnnotation.typeAnnotation) return 'any';

    const type = typeAnnotation.typeAnnotation;
    switch (type.type) {
      case 'TSStringKeyword':
        return 'string';
      case 'TSNumberKeyword':
        return 'number';
      case 'TSBooleanKeyword':
        return 'boolean';
      case 'TSArrayType':
        return `${this.getTSType(type.elementType)}[]`;
      case 'TSTypeReference':
        return type.typeName.name;
      default:
        return 'any';
    }
  }

  private async findComponentExamples(
    componentName: string,
    projectPath: string,
  ): Promise<string[]> {
    // Look for examples in test files or stories
    const examples: string[] = [];

    try {
      const testFiles = await glob(`**/${componentName}.{test,spec,stories}.{js,jsx,ts,tsx}`, {
        cwd: projectPath,
        absolute: true,
      });

      for (const file of testFiles.slice(0, 3)) {
        const content = await readFile(file, 'utf8');

        // Extract simple usage examples
        const usageMatch = content.match(new RegExp(`<${componentName}[^>]*>`, 'g')); // eslint-disable-line security/detect-non-literal-regexp
        if (usageMatch) {
          examples.push(...usageMatch.slice(0, 2));
        }
      }
    } catch {}

    return examples;
  }

  private async findModuleDependencies(module: string, projectPath: string): Promise<string[]> {
    // Simplified dependency detection
    const deps: Set<string> = new Set();

    try {
      const files = await glob(`**/src/${module}/**/*.{js,jsx,ts,tsx}`, {
        cwd: projectPath,
        absolute: true,
      });

      for (const file of files.slice(0, 10)) {
        const content = await readFile(file, 'utf8');

        // Find imports from other modules
        const importMatches = content.match(/from ['"]@?\/?src\/([^/'"]+)/g);
        if (importMatches) {
          importMatches.forEach(match => {
            const dep = match.match(/src\/([^/'"]+)/)?.[1];
            if (dep && dep !== module) {
              deps.add(dep);
            }
          });
        }
      }
    } catch {}

    return Array.from(deps);
  }

  private generateModuleDiagram(modules: any[]): string {
    // Generate Mermaid diagram
    let diagram = '```mermaid\ngraph TB\n';

    modules.forEach((module, i) => {
      diagram += `  ${module.name}[${module.name}]\n`;

      module.dependencies.forEach((dep: string) => {
        diagram += `  ${module.name} --> ${dep}\n`;
      });
    });

    diagram += '```';
    return diagram;
  }

  private generateArchitectureOverview(modules: any[]): string {
    return (
      `The application is organized into ${modules.length} main modules:\n\n` +
      modules.map(m => `- **${m.name}**: ${m.description}`).join('\n') +
      '\n\nSee the diagram below for module dependencies.'
    );
  }

  private describeScript(script: string, command: string): string {
    const descriptions: Record<string, string> = {
      dev: 'Start development server',
      build: 'Build for production',
      start: 'Start production server',
      test: 'Run tests',
      lint: 'Run linter',
      format: 'Format code',
      typecheck: 'Run TypeScript type checking',
    };

    return descriptions[script] || command.substring(0, 50);
  }

  private formatAPIDocs(api: any, format: string): string {
    if (format === 'json') {
      return JSON.stringify(api, null, 2);
    }

    let content = '# API Documentation\n\n';
    content += `Base URL: ${api.baseUrl}\n\n`;
    content += `Authentication: ${api.authentication}\n\n`;

    content += '## Endpoints\n\n';

    for (const endpoint of api.endpoints) {
      content += `### ${endpoint.method} ${endpoint.path}\n\n`;
      content += `${endpoint.description}\n\n`;

      if (endpoint.parameters.length > 0) {
        content += '**Parameters:**\n\n';
        content += '| Name | Type | Required | Description |\n';
        content += '|------|------|----------|-------------|\n';

        for (const param of endpoint.parameters) {
          content += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
        }
        content += '\n';
      }

      content += '**Responses:**\n\n';
      for (const response of endpoint.responses) {
        content += `- \`${response.status}\`: ${response.description}\n`;
      }
      content += '\n---\n\n';
    }

    return content;
  }

  private formatComponentDocs(components: any, format: string): string {
    if (format === 'json') {
      return JSON.stringify(components, null, 2);
    }

    let content = `# Component Documentation\n\n`;
    content += `Framework: ${components.framework}\n\n`;

    for (const component of components.components) {
      content += `## ${component.name}\n\n`;
      content += `${component.description}\n\n`;

      if (component.props.length > 0) {
        content += '### Props\n\n';
        content += '| Prop | Type | Required | Default | Description |\n';
        content += '|------|------|----------|---------|-------------|\n';

        for (const prop of component.props) {
          content += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.default || '-'} | ${prop.description} |\n`;
        }
        content += '\n';
      }

      if (component.examples && component.examples.length > 0) {
        content += '### Examples\n\n```jsx\n';
        content += component.examples.join('\n');
        content += '\n```\n\n';
      }

      content += '---\n\n';
    }

    return content;
  }

  private formatArchitectureDocs(architecture: any, format: string): string {
    if (format === 'json') {
      return JSON.stringify(architecture, null, 2);
    }

    let content = '# Architecture Documentation\n\n';
    content += '## Overview\n\n';
    content += architecture.overview + '\n\n';

    if (architecture.diagrams.length > 0) {
      content += '## Module Diagram\n\n';
      content += architecture.diagrams[0] + '\n\n';
    }

    content += '## Modules\n\n';
    for (const module of architecture.modules) {
      content += `### ${module.name}\n\n`;
      content += `${module.description}\n\n`;

      if (module.dependencies.length > 0) {
        content += '**Dependencies:** ' + module.dependencies.join(', ') + '\n\n';
      }
    }

    return content;
  }

  private formatChangelog(changelog: any): string {
    let content = '# Changelog\n\n';
    content += 'All notable changes to this project will be documented in this file.\n\n';

    for (const entry of changelog.entries) {
      content += `## [${entry.version}] - ${entry.date}\n\n`;

      for (const change of entry.changes) {
        content += `- ${change}\n`;
      }
      content += '\n';
    }

    return content;
  }

  private getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      markdown: 'md',
      mdx: 'mdx',
      json: 'json',
      html: 'html',
    };

    return extensions[format] || 'md';
  }
}

// Create the tool
export const documentationGeneratorTool = tool({
  description: 'Generate comprehensive documentation from code analysis',
  inputSchema: inputSchema,
  execute: async input => {
    const generator = new DocumentationGenerator();
    const result = await generator.generate(input);

    // Store results in MCP memory - removed for now to fix types
    // const entityName = createEntityName('documentation', input.path);
    /* await context.mcp.createEntities({
      entities: [
        {
          name: entityName,
          entityType: 'documentation',
          observations: [
            `Generated ${result.filesGenerated.length} documentation files`,
            `Documentation types: ${input.docTypes.join(', ')}`,
            `Output format: ${input.format}`,
            safeStringify(result),
          ],
        },
      ],
    }); */

    // Log summary
    logInfo('Documentation generation completed', {
      filesGenerated: result.filesGenerated.length,
      types: input.docTypes,
      outputDir: input.outputDir,
    });

    return result;
  },
});

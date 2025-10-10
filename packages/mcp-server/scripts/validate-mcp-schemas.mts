#!/usr/bin/env node

/**
 * MCP Schema Validator
 * Validates that all MCP tool inputSchemas have complete and correct property definitions
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const PROJECT_ROOT = join(import.meta.dirname, '../../..');

interface SchemaViolation {
  file: string;
  line: number;
  tool: string;
  property: string;
  issue: string;
}

const VALID_TYPES = new Set(['string', 'number', 'boolean', 'object', 'array']);

/**
 * Find all tool files in the codebase
 */
function findToolFiles(): string[] {
  const toolFiles: string[] = [];

  // Search in core-utils/src/server
  const coreUtilsServer = join(PROJECT_ROOT, 'packages/core-utils/src/server');
  if (statSync(coreUtilsServer, { throwIfNoEntry: false })) {
    const files = readdirSync(coreUtilsServer);
    for (const file of files) {
      if (file.endsWith('-tool.ts') || file === 'simple-tools.ts') {
        toolFiles.push(join(coreUtilsServer, file));
      }
    }
  }

  // Search in mcp-server/src/tools
  const mcpServerTools = join(PROJECT_ROOT, 'packages/mcp-server/src/tools');
  if (statSync(mcpServerTools, { throwIfNoEntry: false })) {
    const files = readdirSync(mcpServerTools);
    for (const file of files) {
      if (file.endsWith('.ts') && file !== 'index.ts' && file !== 'agent-utilities.ts') {
        toolFiles.push(join(mcpServerTools, file));
      }
    }
  }

  return toolFiles;
}

/**
 * Extract tool definitions from a file
 */
function extractToolDefinitions(filePath: string, content: string): Array<{ name: string; line: number; schema: string }> {
  const tools: Array<{ name: string; line: number; schema: string }> = [];
  const lines = content.split('\n');

  // Find tool exports: export const toolNameTool = {
  const toolExportRegex = /export\s+const\s+(\w+Tool)\s*=\s*\{/g;
  let match;

  while ((match = toolExportRegex.exec(content)) !== null) {
    const toolName = match[1];
    const startIndex = match.index;

    // Find the line number
    const lineNumber = content.substring(0, startIndex).split('\n').length;

    // Extract the tool object (find matching braces)
    const toolStart = match.index + match[0].length - 1; // Position of opening brace
    const toolEnd = findMatchingBrace(content, toolStart);

    if (toolEnd !== -1) {
      const toolObject = content.substring(toolStart, toolEnd + 1);

      // Find inputSchema within the tool object
      const inputSchemaMatch = /inputSchema\s*:\s*\{/.exec(toolObject);
      if (inputSchemaMatch) {
        const schemaStart = inputSchemaMatch.index + inputSchemaMatch[0].length - 1;
        const schemaEnd = findMatchingBrace(toolObject, schemaStart);

        if (schemaEnd !== -1) {
          const schema = toolObject.substring(schemaStart, schemaEnd + 1);
          tools.push({ name: toolName, line: lineNumber, schema });
        }
      }
    }
  }

  return tools;
}

/**
 * Find matching closing brace
 */
function findMatchingBrace(text: string, startIndex: number): number {
  let depth = 1;
  let inString = false;
  let inTemplate = false;
  let stringChar = '';
  let i = startIndex + 1;

  while (i < text.length && depth > 0) {
    const char = text[i];
    const prevChar = text[i - 1];

    // Handle template literals
    if (char === '`' && prevChar !== '\\') {
      inTemplate = !inTemplate;
    }

    // Handle strings
    if (!inTemplate && (char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }

    // Count braces only outside strings
    if (!inString && !inTemplate) {
      if (char === '{') depth++;
      if (char === '}') depth--;
    }

    i++;
  }

  return depth === 0 ? i - 1 : -1;
}

/**
 * Parse properties from inputSchema
 */
function parseProperties(schema: string): Array<{ name: string; definition: string; line: number }> {
  const properties: Array<{ name: string; definition: string; line: number }> = [];

  // Find properties object
  const propertiesMatch = /properties\s*:\s*\{/.exec(schema);
  if (!propertiesMatch) {
    return properties;
  }

  const propertiesStart = propertiesMatch.index + propertiesMatch[0].length - 1;
  const propertiesEnd = findMatchingBrace(schema, propertiesStart);

  if (propertiesEnd === -1) {
    return properties;
  }

  const propertiesBlock = schema.substring(propertiesStart + 1, propertiesEnd);

  // Parse individual properties
  // Match property names followed by colons and objects
  const propertyRegex = /(\w+)\s*:\s*\{/g;
  let match;

  while ((match = propertyRegex.exec(propertiesBlock)) !== null) {
    const propName = match[1];
    const propStart = match.index + match[0].length - 1;
    const propEnd = findMatchingBrace(propertiesBlock, propStart);

    if (propEnd !== -1) {
      const propDefinition = propertiesBlock.substring(propStart, propEnd + 1);
      const lineNumber = propertiesBlock.substring(0, propStart).split('\n').length;

      properties.push({
        name: propName,
        definition: propDefinition,
        line: lineNumber,
      });
    }
  }

  return properties;
}

/**
 * Validate a property definition
 */
function validateProperty(
  property: { name: string; definition: string; line: number },
  toolName: string,
  filePath: string,
  baseLineNumber: number
): SchemaViolation[] {
  const violations: SchemaViolation[] = [];
  const def = property.definition;

  // Check for 'type' field
  const typeMatch = /type\s*:\s*['"](\w+)['"]/. exec(def) || /type\s*:\s*['"](\w+)['"]\s+as\s+const/.exec(def);

  if (!typeMatch) {
    violations.push({
      file: relative(PROJECT_ROOT, filePath),
      line: baseLineNumber + property.line,
      tool: toolName,
      property: property.name,
      issue: "Missing required field 'type'",
    });
  } else {
    const type = typeMatch[1];
    if (!VALID_TYPES.has(type)) {
      violations.push({
        file: relative(PROJECT_ROOT, filePath),
        line: baseLineNumber + property.line,
        tool: toolName,
        property: property.name,
        issue: `Invalid type '${type}'. Must be one of: ${Array.from(VALID_TYPES).join(', ')}`,
      });
    }

    // If type is array, check for items
    if (type === 'array' && !/items\s*:/.test(def)) {
      violations.push({
        file: relative(PROJECT_ROOT, filePath),
        line: baseLineNumber + property.line,
        tool: toolName,
        property: property.name,
        issue: "Array type must have 'items' field defining element type",
      });
    }
  }

  // Check for description (warning, not error)
  if (!/description\s*:/.test(def)) {
    violations.push({
      file: relative(PROJECT_ROOT, filePath),
      line: baseLineNumber + property.line,
      tool: toolName,
      property: property.name,
      issue: "Missing recommended field 'description' (helps with documentation)",
    });
  }

  // Check for enum with type
  if (/enum\s*:\s*\[/.test(def) && !typeMatch) {
    violations.push({
      file: relative(PROJECT_ROOT, filePath),
      line: baseLineNumber + property.line,
      tool: toolName,
      property: property.name,
      issue: "Enum properties should have explicit 'type' field",
    });
  }

  return violations;
}

/**
 * Validate all tools in a file
 */
function validateFile(filePath: string): SchemaViolation[] {
  const violations: SchemaViolation[] = [];

  try {
    const content = readFileSync(filePath, 'utf8');
    const tools = extractToolDefinitions(filePath, content);

    for (const tool of tools) {
      const properties = parseProperties(tool.schema);

      for (const property of properties) {
        const propViolations = validateProperty(property, tool.name, filePath, tool.line);
        violations.push(...propViolations);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }

  return violations;
}

/**
 * Main validation function
 */
function validateMcpSchemas(): { violations: SchemaViolation[]; totalTools: number; totalProperties: number } {
  console.log('🔍 Scanning for MCP tool definitions...\n');

  const toolFiles = findToolFiles();
  console.log(`Found ${toolFiles.length} tool files\n`);

  let totalTools = 0;
  let totalProperties = 0;
  const allViolations: SchemaViolation[] = [];

  for (const file of toolFiles) {
    const content = readFileSync(file, 'utf8');
    const tools = extractToolDefinitions(file, content);
    totalTools += tools.length;

    for (const tool of tools) {
      const properties = parseProperties(tool.schema);
      totalProperties += properties.length;
    }

    const violations = validateFile(file);
    allViolations.push(...violations);
  }

  return {
    violations: allViolations,
    totalTools,
    totalProperties,
  };
}

/**
 * Format and display violations
 */
function displayViolations(violations: SchemaViolation[]): void {
  if (violations.length === 0) {
    console.log('✅ All MCP tool schemas are valid!\n');
    return;
  }

  console.log(`❌ Found ${violations.length} schema violation(s):\n`);

  // Group by file
  const byFile = new Map<string, SchemaViolation[]>();
  for (const violation of violations) {
    if (!byFile.has(violation.file)) {
      byFile.set(violation.file, []);
    }
    byFile.get(violation.file)!.push(violation);
  }

  // Display grouped violations
  for (const [file, fileViolations] of byFile) {
    console.log(`📄 ${file}`);

    for (const violation of fileViolations) {
      console.log(`   Line ${violation.line} | ${violation.tool} | ${violation.property}`);
      console.log(`   └─ ${violation.issue}\n`);
    }
  }
}

/**
 * Main entry point
 */
function main(): void {
  console.log('🛠️  MCP Schema Validator\n');
  console.log('=' .repeat(60) + '\n');

  const result = validateMcpSchemas();

  console.log(`📊 Validation Summary:`);
  console.log(`   Tools scanned: ${result.totalTools}`);
  console.log(`   Properties checked: ${result.totalProperties}`);
  console.log(`   Violations found: ${result.violations.length}\n`);

  displayViolations(result.violations);

  // Exit with error code if violations found
  if (result.violations.length > 0) {
    process.exit(1);
  }

  console.log('🎉 Schema validation passed!\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

/**
 * MCP Utils - Agent Utility Tools
 * Common utilities for Claude Code quality agents
 * Enhanced with Node.js 22+ error handling, context tracking, and abort support
 */

import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import {
  AgentRequest,
  createEntityName as createEntityNameUtil,
  EntityType,
  extractObservation as extractObservationUtil,
  formatAgentResponse as formatAgentResponseUtil,
  MCPEntity,
  validateAgentRequest as validateAgentRequestUtil,
} from '../utils/agent-helpers';
import { runWithContext } from '../utils/context';
import { ok, runTool } from '../utils/tool-helpers';
import { validateSessionId } from '../utils/validation';

export interface ExtractObservationArgs extends AbortableToolArgs {
  entity: MCPEntity;
  key: string;
}

export interface CreateEntityNameArgs extends AbortableToolArgs {
  entityType: EntityType;
  sessionId: string;
  additionalIds?: string[];
}

export interface ValidateAgentRequestArgs extends AbortableToolArgs {
  request: AgentRequest;
  requiredFields: string[];
  version?: string;
}

export interface FormatAgentResponseArgs extends AbortableToolArgs {
  success: boolean;
  data?: Record<string, unknown> | string | number | boolean | null;
  error?: string;
}

/**
 * Extract observation value from MCP entity
 */
export const extractObservationTool = {
  name: 'extract_observation',
  description: 'Extract observation value from MCP memory entity',
  inputSchema: {
    type: 'object',
    properties: {
      entity: {
        type: 'object',
        description: 'The entity object from MCP memory',
        properties: {
          observations: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      key: {
        type: 'string',
        description: 'The key to extract from observations',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['entity', 'key'],
  },
  execute: async ({ entity, key, signal }: ExtractObservationArgs): Promise<MCPToolResponse> => {
    return runTool('extract_observation', 'extract', async () => {
      // Check for abort signal at start
      throwIfAborted(signal);

      return runWithContext(
        {
          toolName: 'extract_observation',
          metadata: { key, entityType: (entity as any)?.entityType },
        },
        async () => {
          const value = extractObservationUtil(entity, key);
          return ok({ value });
        },
      );
    });
  },
};

/**
 * Create standardized entity name for MCP memory
 */
export const createEntityNameTool = {
  name: 'create_entity_name',
  description: 'Create standardized entity name for MCP memory storage',
  inputSchema: {
    type: 'object',
    properties: {
      entityType: {
        type: 'string',
        description: 'Type of entity (e.g., AnalysisSession, FileAnalysis, GitWorktree)',
        enum: [
          'AnalysisSession',
          'FileAnalysis',
          'GitWorktree',
          'PullRequest',
          'ArchitecturalPattern',
          'VercelOptimization',
          'MockAnalysis',
          'UtilizationAnalysis',
          'WordRemoval',
        ],
      },
      sessionId: {
        type: 'string',
        description: 'Session ID for the entity',
      },
      additionalIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Additional IDs to append (e.g., file path)',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['entityType', 'sessionId'],
  },
  execute: async ({
    entityType,
    sessionId,
    additionalIds = [],
    signal,
  }: CreateEntityNameArgs): Promise<MCPToolResponse> => {
    return runTool('create_entity_name', 'create', async () => {
      // Check for abort signal at start
      throwIfAborted(signal);

      // Validate session ID
      const sessionValidation = validateSessionId(sessionId);
      if (!sessionValidation.isValid) {
        throw new Error(`Invalid session ID: ${sessionValidation.error}`);
      }

      return runWithContext(
        {
          toolName: 'create_entity_name',
          metadata: { entityType, sessionId, additionalIdsCount: additionalIds.length },
        },
        async () => {
          const name = createEntityNameUtil(entityType, sessionId, additionalIds);
          return ok({ name });
        },
      );
    });
  },
};

/**
 * Validate agent request format
 */
export const validateAgentRequestTool = {
  name: 'validate_agent_request',
  description: 'Validate agent request format and required fields',
  inputSchema: {
    type: 'object',
    properties: {
      request: {
        type: 'object',
        description: 'The request object to validate',
      },
      requiredFields: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of required fields',
      },
      version: {
        type: 'string',
        description: 'Expected protocol version',
        default: '1.0',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['request', 'requiredFields'],
  },
  execute: async ({
    request,
    requiredFields,
    version = '1.0',
    signal,
  }: ValidateAgentRequestArgs): Promise<MCPToolResponse> => {
    return runTool('validate_agent_request', 'validate', async () => {
      // Check for abort signal at start
      throwIfAborted(signal);

      return runWithContext(
        {
          toolName: 'validate_agent_request',
          metadata: { requiredFieldsCount: requiredFields.length, version },
        },
        async () => {
          const result = validateAgentRequestUtil(request, requiredFields, version);
          return ok(result);
        },
      );
    });
  },
};

/**
 * Format agent response
 */
export const formatAgentResponseTool = {
  name: 'format_agent_response',
  description: 'Format standardized agent response',
  inputSchema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Whether the operation succeeded',
      },
      data: {
        description: 'Response data (optional)',
      },
      error: {
        type: 'string',
        description: 'Error message (optional)',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['success'],
  },
  execute: async ({
    success,
    data,
    error,
    signal,
  }: FormatAgentResponseArgs): Promise<MCPToolResponse> => {
    return runTool('format_agent_response', 'format', async () => {
      // Check for abort signal at start
      throwIfAborted(signal);

      return runWithContext(
        {
          toolName: 'format_agent_response',
          metadata: { success, hasData: !!data, hasError: !!error },
        },
        async () => {
          const response = formatAgentResponseUtil(success, data, error);
          return ok(response);
        },
      );
    });
  },
};

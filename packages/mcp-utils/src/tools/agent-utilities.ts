/**
 * MCP Utils - Agent Utility Tools
 * Common utilities for Claude Code quality agents
 */

import { 
  MCPEntity, 
  EntityType, 
  AgentRequest, 
  ValidationResult,
  AgentResponse,
  extractObservation as extractObservationUtil,
  createEntityName as createEntityNameUtil,
  validateAgentRequest as validateAgentRequestUtil,
  formatAgentResponse as formatAgentResponseUtil
} from '../utils/agent-helpers';

export interface MCPToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export interface ExtractObservationArgs {
  entity: MCPEntity;
  key: string;
}

export interface CreateEntityNameArgs {
  entityType: EntityType;
  sessionId: string;
  additionalIds?: string[];
}

export interface ValidateAgentRequestArgs {
  request: AgentRequest;
  requiredFields: string[];
  version?: string;
}

export interface FormatAgentResponseArgs {
  success: boolean;
  data?: any;
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
            items: { type: 'string' }
          }
        }
      },
      key: {
        type: 'string',
        description: 'The key to extract from observations'
      }
    },
    required: ['entity', 'key']
  },
  execute: async ({ entity, key }: ExtractObservationArgs): Promise<MCPToolResponse> => {
    const value = extractObservationUtil(entity, key);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ value })
      }]
    };
  }
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
          'WordRemoval'
        ]
      },
      sessionId: {
        type: 'string',
        description: 'Session ID for the entity'
      },
      additionalIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Additional IDs to append (e.g., file path)'
      }
    },
    required: ['entityType', 'sessionId']
  },
  execute: async ({ entityType, sessionId, additionalIds = [] }: CreateEntityNameArgs): Promise<MCPToolResponse> => {
    const name = createEntityNameUtil(entityType, sessionId, additionalIds);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ name })
      }]
    };
  }
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
        description: 'The request object to validate'
      },
      requiredFields: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of required fields'
      },
      version: {
        type: 'string',
        description: 'Expected protocol version',
        default: '1.0'
      }
    },
    required: ['request', 'requiredFields']
  },
  execute: async ({ request, requiredFields, version = '1.0' }: ValidateAgentRequestArgs): Promise<MCPToolResponse> => {
    const result = validateAgentRequestUtil(request, requiredFields, version);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result)
      }]
    };
  }
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
        description: 'Whether the operation succeeded'
      },
      data: {
        description: 'Response data (optional)'
      },
      error: {
        type: 'string',
        description: 'Error message (optional)'
      }
    },
    required: ['success']
  },
  execute: async ({ success, data, error }: FormatAgentResponseArgs): Promise<MCPToolResponse> => {
    const response = formatAgentResponseUtil(success, data, error);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response)
      }]
    };
  }
};
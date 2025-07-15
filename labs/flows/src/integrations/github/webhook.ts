// integrations/github/webhook.ts
'use server';

// Server action types
type GithubFormData = {
  name: string | null;
  isEnabled: boolean;
  metadata: {
    repositoryUrl: string;
    secret: string;
    events: string[];
    webhookUrl?: string;
  } | null;
  uxMeta: {
    heading?: string;
    isExpanded?: boolean;
    layer?: number;
  };
};

type GitHubEventType =
  | 'push'
  | 'pull_request'
  | 'issues'
  | 'deployment'
  | 'star'
  | 'release'
  | 'workflow_run'
  | string;

interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
}

type GithubWebhook = {
  id: number;
  config: {
    url: string;
    content_type: string;
    secret?: string;
  };
  events: GitHubEventType[];
  active: boolean;
};

type GithubRepoInfo = {
  owner: string;
  repo: string;
};

type WebhookConfig = {
  config: {
    url: string;
    content_type: 'json';
    secret: string;
  };
  events: GitHubEventType[];
  active: boolean;
};

type ConfigureWebhookResult = {
  success: boolean;
  webhookId?: number;
  webhookUrl?: string;
  error?: string;
};

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!ROOT_DOMAIN) {
  throw new Error(
    'NEXT_PUBLIC_ROOT_DOMAIN environment variable is not configured',
  );
}

/**
 * Creates standardized headers for GitHub API requests
 */
const createGithubHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

/**
 * Makes a request to the GitHub API with proper error handling
 */
const makeGithubRequest = async <T>(
  endpoint: string,
  options: RequestInit,
  token: string,
): Promise<T> => {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: createGithubHeaders(token),
  });

  if (!response.ok) {
    const error = (await response.json()) as GitHubErrorResponse;
    throw new Error(
      error.message || `GitHub API request failed: ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
};

/**
 * Extracts owner and repository name from a GitHub URL
 */
const extractRepoInfo = (url: string): GithubRepoInfo => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub repository URL');
  return { owner: match[1], repo: match[2].replace('.git', '') };
};

/**
 * Validates access to the GitHub repository
 */
const validateRepoAccess = async (
  repoUrl: string,
  token: string,
): Promise<boolean> => {
  const { owner, repo } = extractRepoInfo(repoUrl);
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers: createGithubHeaders(token) },
  );
  return response.ok;
};

/**
 * Server action to configure GitHub webhook
 */
export async function configureGithubWebhook(
  formData: GithubFormData,
): Promise<ConfigureWebhookResult> {
  try {
    if (!formData.metadata?.repositoryUrl || !formData.metadata.secret) {
      throw new Error('Missing required fields');
    }

    // Check GitHub token from environment
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

    // Validate repository access
    const hasAccess = await validateRepoAccess(
      formData.metadata.repositoryUrl,
      GITHUB_TOKEN,
    );

    if (!hasAccess) {
      throw new Error('No access to repository or repository not found');
    }

    const { owner, repo } = extractRepoInfo(formData.metadata.repositoryUrl);
    const webhookConfig: WebhookConfig = {
      config: {
        url: `https://${ROOT_DOMAIN}/api/github/webhook`,
        content_type: 'json',
        secret: formData.metadata.secret,
      },
      events: (formData.metadata.events || ['push']) as GitHubEventType[],
      active: formData.isEnabled,
    };

    const endpoint = `/repos/${owner}/${repo}/hooks`;

    // Check existing webhooks
    const hooks = await makeGithubRequest<GithubWebhook[]>(
      endpoint,
      { method: 'GET' },
      GITHUB_TOKEN,
    );

    const existingHook = hooks.find(
      (hook) =>
        hook.config?.url && hook.config.url === webhookConfig.config.url,
    );

    let webhook: GithubWebhook;

    if (existingHook) {
      // Update existing webhook
      webhook = await makeGithubRequest<GithubWebhook>(
        `${endpoint}/${existingHook.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(webhookConfig),
        },
        GITHUB_TOKEN,
      );
    } else {
      // Create new webhook
      webhook = await makeGithubRequest<GithubWebhook>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(webhookConfig),
        },
        GITHUB_TOKEN,
      );
    }

    return {
      success: true,
      webhookId: webhook.id,
      webhookUrl: webhookConfig.config.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

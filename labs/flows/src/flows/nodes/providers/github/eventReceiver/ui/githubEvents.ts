export const githubEvents = [
  // Repository Events
  { label: 'Push - Code pushed to any branch', value: 'push' },
  { label: 'Branch/Tag - Branch or tag created/deleted', value: 'create' },
  { label: 'Release - New release published', value: 'release' },
  {
    label: 'Repository - Repository created, deleted, or modified',
    value: 'repository',
  },

  // Pull Request Events
  {
    label: 'Pull Request - PRs opened, closed, or modified',
    value: 'pull_request',
  },
  {
    label: 'Pull Request Review - PR reviews submitted/edited',
    value: 'pull_request_review',
  },
  {
    label: 'Pull Request Comment - Comments on PRs',
    value: 'pull_request_review_comment',
  },

  // Issue Events
  { label: 'Issues - Issues created or modified', value: 'issues' },
  { label: 'Issue Comment - Comments on issues', value: 'issue_comment' },

  // Discussion Events
  {
    label: 'Discussion - Repo discussions created/modified',
    value: 'discussion',
  },
  {
    label: 'Discussion Comment - Comments on discussions',
    value: 'discussion_comment',
  },

  // Security Events
  {
    label: 'Security Alert - Security vulnerabilities found',
    value: 'security_advisory',
  },
  {
    label: 'CodeScan Alert - Code scanning alerts',
    value: 'code_scanning_alert',
  },

  // Social Events
  { label: 'Star - Repository starred/unstarred', value: 'star' },
  { label: 'Fork - Repository forked', value: 'fork' },
  { label: 'Watch - Repository watched/unwatched', value: 'watch' },

  // CI/CD Events
  {
    label: 'Workflow Run - GitHub Actions workflow completed',
    value: 'workflow_run',
  },
  { label: 'Deployment - New deployments created', value: 'deployment' },
  {
    label: 'Deployment Status - Deployment status updates',
    value: 'deployment_status',
  },

  // Project Events
  { label: 'Project - Project board changes', value: 'project' },
  {
    label: 'Project Card - Cards moved in project board',
    value: 'project_card',
  },
  {
    label: 'Project Column - Columns added/moved in board',
    value: 'project_column',
  },

  // Wiki Events
  { label: 'Wiki - Wiki page updated', value: 'gollum' },

  // Member Events
  { label: 'Member - Collaborator added/removed', value: 'member' },
  { label: 'Team - Team added/removed from repository', value: 'team_add' },

  // Status Events
  { label: 'Status - Commit status updated', value: 'status' },
  { label: 'Check Run - Check run updated', value: 'check_run' },
  { label: 'Check Suite - Check suite updated', value: 'check_suite' },
].sort((a, b) => a.label.localeCompare(b.label)); // Alphabetically sort for easier finding

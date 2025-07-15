import type { Collaborator } from '../types/collaboration';

// Collaboration utility functions
export function isUserActive(collaborator: Collaborator): boolean {
  const now = new Date();
  const lastSeen = new Date(collaborator.lastSeen);
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  return collaborator.isActive && lastSeen > fiveMinutesAgo;
}

export function formatUserName(collaborator: Collaborator): string {
  return collaborator.name || 'Anonymous User';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function sortCollaboratorsByActivity(collaborators: Collaborator[]): Collaborator[] {
  return [...collaborators].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
  });
}

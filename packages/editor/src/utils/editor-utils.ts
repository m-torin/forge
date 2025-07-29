// Editor utility functions
export function generateUserId(): string {
  return `user-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - Fixed catastrophic backtracking
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
}

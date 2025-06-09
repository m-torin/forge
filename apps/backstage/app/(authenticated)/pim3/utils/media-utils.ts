import type { MediaEntityType } from '../media/actions';

export function extractFolderFromUrl(url: string): string {
  if (!url.includes('/')) return 'General';

  const urlParts = url.split('/');
  const pathPart = urlParts[urlParts.length - 2]; // Second to last part

  if (!pathPart || pathPart === 'uploads' || pathPart === 'media') {
    return 'General';
  }

  return pathPart.charAt(0).toUpperCase() + pathPart.slice(1);
}

export function getFolderFromEntityType(entityType: MediaEntityType): string {
  switch (entityType) {
    case 'PRODUCT':
      return 'Products';
    case 'BRAND':
      return 'Brands';
    case 'CATEGORY':
      return 'Categories';
    case 'COLLECTION':
      return 'Collections';
    case 'ARTICLE':
      return 'Articles';
    case 'TAXONOMY':
      return 'Categories';
    case 'REVIEW':
      return 'Reviews';
    case 'USER':
      return 'General';
    default:
      return 'General';
  }
}

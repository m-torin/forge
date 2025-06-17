import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import React from 'react';

import type {
  BarcodeType,
  BrandType,
  CollectionType,
  ContentStatus,
  ProductStatus,
  TaxonomyType,
} from '@repo/database/prisma';

/**
 * Get the appropriate color for a content status
 * @param status - The content status (PUBLISHED, DRAFT, ARCHIVED)
 * @returns Mantine color string
 */
export const getStatusColor = (status: ContentStatus | ProductStatus | string): string => {
  switch (status) {
    case 'PUBLISHED':
    case 'ACTIVE':
      return 'green';
    case 'DRAFT':
      return 'gray';
    case 'ARCHIVED':
      return 'red';
    case 'DISCONTINUED':
      return 'orange';
    default:
      return 'gray';
  }
};

/**
 * Get the appropriate color for a brand type
 * @param type - The brand type
 * @returns Mantine color string
 */
export const getBrandTypeColor = (type: BrandType | string): string => {
  switch (type) {
    case 'MANUFACTURER':
      return 'blue';
    case 'RETAILER':
      return 'green';
    case 'MARKETPLACE':
      return 'purple';
    case 'SERVICE':
      return 'orange';
    default:
      return 'gray';
  }
};

/**
 * Get the appropriate color for a collection type
 * @param type - The collection type
 * @returns Mantine color string
 */
export const getCollectionTypeColor = (type: CollectionType | string): string => {
  switch (type) {
    case 'SEASONAL':
      return 'blue';
    case 'THEMATIC':
      return 'purple';
    case 'PRODUCT_LINE':
      return 'green';
    case 'BRAND_LINE':
      return 'teal';
    case 'PROMOTIONAL':
      return 'red';
    case 'CURATED':
      return 'violet';
    case 'TRENDING':
      return 'orange';
    case 'FEATURED':
      return 'yellow';
    case 'NEW_ARRIVALS':
      return 'lime';
    case 'BEST_SELLERS':
      return 'gold';
    case 'CLEARANCE':
      return 'pink';
    case 'LIMITED_EDITION':
      return 'indigo';
    case 'COLLABORATION':
      return 'cyan';
    case 'EXCLUSIVE':
      return 'grape';
    case 'BUNDLE':
      return 'brown';
    case 'SET':
      return 'dark';
    default:
      return 'gray';
  }
};

/**
 * Get the appropriate color for a taxonomy type
 * @param type - The taxonomy type
 * @returns Mantine color string
 */
export const getTaxonomyTypeColor = (type: TaxonomyType | string): string => {
  switch (type) {
    case 'CATEGORY':
      return 'blue';
    case 'TAG':
      return 'green';
    case 'ATTRIBUTE':
      return 'purple';
    case 'DEPARTMENT':
      return 'orange';
    case 'COLLECTION':
      return 'cyan';
    case 'OTHER':
      return 'gray';
    default:
      return 'gray';
  }
};

/**
 * Get the appropriate color for a barcode type
 * @param type - The barcode type
 * @returns Mantine color string
 */
export const getBarcodeTypeColor = (type: BarcodeType | string): string => {
  switch (type) {
    case 'UPC_A':
    case 'UPC_E':
      return 'blue';
    case 'EAN_13':
    case 'EAN_8':
      return 'green';
    case 'QR_CODE':
      return 'purple';
    case 'CODE_128':
    case 'CODE_39':
      return 'orange';
    case 'PDF417':
    case 'DATA_MATRIX':
      return 'cyan';
    default:
      return 'gray';
  }
};

/**
 * Format a price value with currency
 * @param price - The price value
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (price?: number | null, currency = 'USD'): string => {
  if (price === null || price === undefined) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    currency,
    style: 'currency',
  }).format(price);
};

/**
 * Format a date for display
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

/**
 * Format a date with time
 * @param date - The date to format
 * @returns Formatted date/time string
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  return formatDate(date, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to slug
 * @returns URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Get availability badge color
 * @param availability - Availability status
 * @returns Mantine color string
 */
export const getAvailabilityColor = (availability?: string): string => {
  switch (availability) {
    case 'In Stock':
      return 'green';
    case 'Limited':
      return 'yellow';
    case 'Out of Stock':
      return 'red';
    case 'Backorder':
      return 'blue';
    default:
      return 'gray';
  }
};

/**
 * Get stock status based on inventory levels
 * @param available - Available stock
 * @param reorderPoint - Reorder point threshold
 * @param maxStock - Maximum stock level
 * @returns Status object with color and label
 */
export const getStockStatus = (
  available: number,
  reorderPoint: number,
  maxStock: number,
): { color: string; label: string } => {
  if (available <= 0) return { color: 'red', label: 'Out of Stock' };
  if (available <= reorderPoint) return { color: 'orange', label: 'Low Stock' };
  if (available >= maxStock * 0.9) return { color: 'yellow', label: 'High Stock' };
  return { color: 'green', label: 'In Stock' };
};

/**
 * Get location stock status based on inventory levels
 * @param available - Available stock at location
 * @param reorderPoint - Reorder point threshold
 * @param maxStock - Maximum stock level
 * @returns Status object with color and label
 */
export const getLocationStockStatus = (
  available: number,
  reorderPoint: number = 10,
  maxStock: number = 100,
): { color: string; label: string } => {
  return getStockStatus(available, reorderPoint, maxStock);
};

// ===== Table Utilities =====

/**
 * Generic sorting function for table data
 * @param data - Array of data to sort
 * @param sortBy - Field to sort by
 * @param reversed - Sort direction
 * @returns Sorted array
 */
export const sortTableData = <T extends Record<string, any>>(
  data: T[],
  sortBy: keyof T | null,
  reversed: boolean,
): T[] => {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return reversed ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return reversed ? bValue - aValue : aValue - bValue;
    }

    if (
      aValue &&
      typeof aValue === 'object' &&
      'getTime' in aValue &&
      bValue &&
      typeof bValue === 'object' &&
      'getTime' in bValue
    ) {
      return reversed
        ? (bValue as Date).getTime() - (aValue as Date).getTime()
        : (aValue as Date).getTime() - (bValue as Date).getTime();
    }

    return 0;
  });
};

/**
 * Filter data based on search query
 * @param data - Array of data to filter
 * @param searchQuery - Search string
 * @param searchFields - Fields to search in
 * @returns Filtered array
 */
export const filterTableData = <T extends Record<string, any>>(
  data: T[],
  searchQuery: string,
  searchFields: (keyof T)[],
): T[] => {
  if (!searchQuery.trim()) return data;

  const query = searchQuery.toLowerCase();
  return data.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(query);
      }
      if (typeof value === 'number') {
        return value.toString().includes(query);
      }
      return false;
    }),
  );
};

// ===== Form Utilities =====

/**
 * Convert form data to FormData object
 * @param values - Form values object
 * @returns FormData instance
 */
export const convertToFormData = (values: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  return formData;
};

// ===== Notification Utilities =====

/**
 * Show success notification
 * @param message - Success message
 * @param title - Notification title (default: 'Success')
 */
export const showSuccessNotification = (message: string, title = 'Success') => {
  notifications.show({
    color: 'green',
    message,
    title,
  });
};

/**
 * Show error notification
 * @param message - Error message
 * @param title - Notification title (default: 'Error')
 */
export const showErrorNotification = (message: string, title = 'Error') => {
  notifications.show({
    color: 'red',
    message,
    title,
  });
};

/**
 * Show loading notification
 * @param message - Loading message
 * @param id - Notification ID for updating
 * @returns Notification ID
 */
export const showLoadingNotification = (message: string, id?: string): string => {
  const notificationId = id || `loading-${Date.now()}`;
  notifications.show({
    id: notificationId,
    autoClose: false,
    loading: true,
    message,
    title: 'Processing',
  });
  return notificationId;
};

/**
 * Update loading notification
 * @param id - Notification ID
 * @param success - Whether operation was successful
 * @param message - Updated message
 */
export const updateLoadingNotification = (id: string, success: boolean, message: string) => {
  notifications.update({
    id,
    autoClose: 3000,
    color: success ? 'green' : 'red',
    loading: false,
    message,
    title: success ? 'Success' : 'Error',
  });
};

// ===== Modal Utilities =====

/**
 * Show confirmation modal
 * @param options - Modal options
 */
export const showConfirmModal = (options: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  danger?: boolean;
}) => {
  modals.openConfirmModal({
    centered: true,
    children: <Text size="sm">{options.message}</Text>,
    confirmProps: { color: options.danger ? 'red' : 'blue' },
    labels: {
      cancel: options.cancelLabel || 'Cancel',
      confirm: options.confirmLabel || 'Confirm',
    },
    onCancel: options.onCancel || (() => {}),
    onConfirm: options.onConfirm,
    title: options.title,
  });
};

/**
 * Show delete confirmation modal
 * @param itemName - Name of item being deleted
 * @param onConfirm - Function to call on confirmation
 */
export const showDeleteConfirmModal = (itemName: string, onConfirm: () => void | Promise<void>) => {
  showConfirmModal({
    confirmLabel: 'Delete',
    danger: true,
    message: `Are you sure you want to delete this ${itemName.toLowerCase()}? This action is irreversible.`,
    onConfirm,
    title: `Delete ${itemName}`,
  });
};

// Add alias for showDeleteConfirmation
export const showDeleteConfirmation = showDeleteConfirmModal;

// ===== Validation Utilities =====

/**
 * Validate slug format
 * @param slug - Slug to validate
 * @returns Error message or null
 */
export const validateSlug = (slug: string): string | null => {
  if (!slug) return 'Slug is required';
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return 'Slug must contain only lowercase letters, numbers, and hyphens';
  }
  return null;
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns Error message or null
 */
export const validateUrl = (url: string): string | null => {
  if (!url) return null; // URL is optional
  if (!/^https?:\/\/.+/.test(url)) {
    return 'URL must start with http:// or https://';
  }
  return null;
};

/**
 * Validate JSON string
 * @param jsonString - JSON string to validate
 * @returns Error message or null
 */
export const validateJson = (jsonString: string): string | null => {
  try {
    JSON.parse(jsonString);
    return null;
  } catch {
    return 'Invalid JSON format';
  }
};

// ===== Barcode Utilities =====

/**
 * Barcode type labels for display
 */
export const BARCODE_TYPE_LABELS: Record<string, string> = {
  AZTEC: 'Aztec',
  CODABAR: 'Codabar',
  CODE_39: 'Code 39',
  CODE_128: 'Code 128',
  DATA_MATRIX: 'Data Matrix',
  EAN_8: 'EAN-8',
  EAN_13: 'EAN-13',
  ITF14: 'ITF-14',
  OTHER: 'Other',
  PDF417: 'PDF417',
  QR_CODE: 'QR Code',
  UPC_A: 'UPC-A',
  UPC_E: 'UPC-E',
};

/**
 * Get barcode type label
 * @param type - Barcode type
 * @returns Display label
 */
export const getBarcodeTypeLabel = (type: string): string => {
  return BARCODE_TYPE_LABELS[type] || type;
};

// ===== Pagination Utilities =====

/**
 * Calculate pagination info
 * @param total - Total number of items
 * @param page - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Pagination info
 */
export const getPaginationInfo = (
  total: number,
  page: number,
  pageSize: number,
): {
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  from: number;
  to: number;
} => {
  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return {
    from,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    to,
    totalPages,
  };
};

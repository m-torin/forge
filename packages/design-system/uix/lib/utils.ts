import { notifications } from '@mantine/notifications';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { parseError } from '@repo/observability/error';

import type { ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const handleError = (error: unknown): void => {
  const message = parseError(error);

  notifications.show({
    color: 'red',
    message,
    title: 'Error',
  });
};

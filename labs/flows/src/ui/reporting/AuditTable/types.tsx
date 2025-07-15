// types.tsx
import { ReactNode } from 'react';
import {
  IconEdit,
  IconPlus,
  IconSquare,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';

export type ActionType =
  | 'Edited'
  | 'Created'
  | 'Stopped'
  | 'Started'
  | 'Deleted';

export interface DataEntry {
  id: string;
  name: string;
  role: string;
  action: ActionType;
  entry: string;
  datetime: string;
  metadata?: {
    previousState?: string;
    newState?: string;
    duration?: string;
    relatedEntries?: string[];
  };
}

export interface ActionProps {
  color: string;
  icon: ReactNode;
}

export interface FilterState {
  searchQuery: string;
  filterRole: string | null;
  filterAction: string | null;
}

export interface ViewProps {
  data: DataEntry[];
  classes: Record<string, string>;
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
}

export const ROLE_OPTIONS = [
  { value: 'engineer', label: 'Engineer' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'manager', label: 'Manager' },
] as const;

export const ACTION_OPTIONS = [
  { value: 'edited', label: 'Edited' },
  { value: 'created', label: 'Created' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'started', label: 'Started' },
  { value: 'deleted', label: 'Deleted' },
] as const;

export const getActionProps = (action: ActionType): ActionProps => {
  const props: { [key in ActionType]: ActionProps } = {
    Edited: {
      color: 'blue',
      icon: <IconEdit size={16} />,
    },
    Created: {
      color: 'green',
      icon: <IconPlus size={16} />,
    },
    Stopped: {
      color: 'orange',
      icon: <IconSquare size={16} />,
    },
    Started: {
      color: 'violet',
      icon: <IconPlayerPlay size={16} />,
    },
    Deleted: {
      color: 'red',
      icon: <IconTrash size={16} />,
    },
  };

  return props[action];
};

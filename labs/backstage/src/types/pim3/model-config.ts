// Simple types for the DRY framework
// This file contains basic type definitions that might be needed in the future
// Currently kept minimal to avoid over-engineering

export interface SimpleField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
}

export interface SimpleAction {
  key: string;
  label: string;
  onClick: () => void;
}

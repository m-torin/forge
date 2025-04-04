'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Title, Text, Stack, PaperProps, Tabs, TabsProps, Group } from '@mantine/core';
import { useFormContext } from '../core';
import { NestedField, useNestedFieldPath } from './array-fields';

/**
 * Props for FormSection component
 */
export interface FormSectionProps extends Omit<PaperProps, 'children'> {
  /**
   * Section title
   */
  title?: string;

  /**
   * Section description
   */
  description?: string;

  /**
   * Section content
   */
  children: React.ReactNode;

  /**
   * Whether to render with a Paper component
   */
  withPaper?: boolean;

  /**
   * Spacing between elements
   */
  spacing?: number | string;

  /**
   * Title heading level
   */
  titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * FormSection component for grouping related form fields
 * This component provides a styled container for form sections
 */
export function FormSection({
  title,
  description,
  children,
  withPaper = true,
  spacing = 'md',
  titleOrder = 3,
  ...paperProps
}: FormSectionProps) {
  // Content to render
  const content = (
    <Stack spacing={spacing}>
      {(title || description) && (
        <div>
          {title && <Title order={titleOrder}>{title}</Title>}
          {description && <Text color="dimmed" size="sm">{description}</Text>}
        </div>
      )}
      {children}
    </Stack>
  );

  // Render with or without Paper
  if (withPaper) {
    return (
      <Paper p="md" withBorder {...paperProps}>
        {content}
      </Paper>
    );
  }

  return <Box {...paperProps}>{content}</Box>;
}

/**
 * Props for the NestedFormSection component
 */
export interface NestedFormSectionProps extends Omit<PaperProps, 'children'> {
  /**
   * The base path for nested fields
   */
  name: string;

  /**
   * Section title
   */
  title?: string;

  /**
   * Section description
   */
  description?: string;

  /**
   * Section content
   */
  children: React.ReactNode;

  /**
   * Whether to render with a Paper component
   */
  withPaper?: boolean;

  /**
   * Spacing between elements
   */
  spacing?: number | string;

  /**
   * Title heading level
   */
  titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * A component for rendering nested form sections with styling
 * This combines the NestedField component with Mantine UI styling
 */
export function NestedFormSection({
  name,
  title,
  description,
  children,
  withPaper = true,
  spacing = 'md',
  titleOrder = 3,
  ...paperProps
}: NestedFormSectionProps) {
  // Content to render
  const content = (
    <Stack spacing={spacing}>
      {(title || description) && (
        <div>
          {title && <Title order={titleOrder}>{title}</Title>}
          {description && <Text color="dimmed" size="sm">{description}</Text>}
        </div>
      )}
      <NestedField name={name}>
        {children}
      </NestedField>
    </Stack>
  );

  // Render with or without Paper
  if (withPaper) {
    return (
      <Paper p="md" withBorder {...paperProps}>
        {content}
      </Paper>
    );
  }

  return <Box {...paperProps}>{content}</Box>;
}

/**
 * Hook for working with nested form fields
 * This provides a way to get the full path for a nested field
 */
export function useNestedForm(basePath: string) {
  const form = useFormContext();

  return {
    /**
     * Get the full path for a nested field
     */
    getFieldPath: (fieldName: string) => {
      return useNestedFieldPath(`${basePath}.${fieldName}`);
    },

    /**
     * Get the value of a nested field
     */
    getFieldValue: <V>(fieldName: string): V => {
      const path = `${basePath}.${fieldName}`;
      return form.getNestedValue<V>(path);
    },

    /**
     * Set the value of a nested field
     */
    setFieldValue: <V>(fieldName: string, value: V) => {
      const path = `${basePath}.${fieldName}`;
      form.setNestedValue(path, value);
    }
  };
}

/**
 * Tab definition
 */
export interface FormTab {
  /**
   * Unique identifier for the tab
   */
  id: string;

  /**
   * Display label for the tab
   */
  label: string;

  /**
   * Optional description for the tab
   */
  description?: string;

  /**
   * Optional list of field names included in this tab
   */
  fields?: string[];

  /**
   * Optional order for sorting tabs
   */
  order?: number;
}

/**
 * Props for FormTabs component
 */
export interface FormTabsProps extends Omit<TabsProps, 'value' | 'onChange'> {
  /**
   * Array of tab definitions
   */
  tabs: FormTab[];

  /**
   * Default active tab
   */
  defaultActiveTab?: string;

  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void;

  /**
   * Whether to render tab panels
   */
  renderPanels?: boolean;

  /**
   * Custom render function for tab panels
   */
  renderTabPanel?: (tabId: string) => React.ReactNode;

  /**
   * Children to render in each tab panel
   */
  children?: React.ReactNode;
}

/**
 * FormTabs component for tab-based form navigation
 * This component uses React state to manage the active tab
 */
export function FormTabs({
  tabs = [],
  defaultActiveTab,
  onTabChange,
  renderPanels = true,
  renderTabPanel,
  children,
  ...tabsProps
}: FormTabsProps) {
  // Sort tabs by order if provided
  const sortedTabs = [...tabs].sort((a, b) =>
    (a.order !== undefined && b.order !== undefined)
      ? a.order - b.order
      : 0
  );

  // State for active tab
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Set default active tab if not already set
  useEffect(() => {
    if (activeTab === null && sortedTabs.length > 0) {
      const firstTabId = defaultActiveTab || sortedTabs[0].id;
      setActiveTab(firstTabId);
    }
  }, [activeTab, defaultActiveTab, sortedTabs]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // If no tabs, render children directly
  if (sortedTabs.length === 0) {
    return <Box>{children}</Box>;
  }

  return (
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      {...tabsProps}
    >
      <Tabs.List>
        {sortedTabs.map(tab => (
          <Tabs.Tab key={tab.id} value={tab.id}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {renderPanels && (
        <>
          {sortedTabs.map(tab => (
            <Tabs.Panel key={tab.id} value={tab.id}>
              {renderTabPanel ? renderTabPanel(tab.id) : children}
            </Tabs.Panel>
          ))}
        </>
      )}
    </Tabs>
  );
}

/**
 * Props for FormTabPanel component
 */
export interface FormTabPanelProps {
  /**
   * Tab ID
   */
  tabId: string;

  /**
   * Active tab ID
   */
  activeTab: string | null;

  /**
   * Children to render in the tab panel
   */
  children: React.ReactNode;
}

/**
 * FormTabPanel component for rendering content for a specific tab
 */
export function FormTabPanel({
  tabId,
  activeTab,
  children
}: FormTabPanelProps) {
  // If this tab is not active, don't render anything
  if (activeTab !== tabId) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook for using form tabs with the form context
 */
export function useFormTabs(tabs: FormTab[], defaultActiveTab?: string) {
  const [activeTab, setActiveTab] = useState<string | null>(
    defaultActiveTab || (tabs.length > 0 ? tabs[0].id : null)
  );

  const form = useFormContext();

  // Get fields for the active tab
  const activeTabFields = useMemo(() => {
    if (!activeTab) return [];
    const tab = tabs.find(t => t.id === activeTab);
    return tab?.fields || [];
  }, [activeTab, tabs]);

  // Check if a field is in the active tab
  const isFieldInActiveTab = (fieldName: string) => {
    if (!activeTab) return true;
    const tab = tabs.find(t => t.id === activeTab);
    return !tab?.fields || tab.fields.includes(fieldName);
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    activeTabFields,
    isFieldInActiveTab
  };
}

/**
 * Props for FormRow component
 */
export interface FormRowProps {
  /**
   * Children to render in the row
   */
  children: React.ReactNode;

  /**
   * Spacing between elements
   */
  spacing?: number | string;

  /**
   * Alignment of items
   */
  align?: 'flex-start' | 'center' | 'flex-end';

  /**
   * Whether to grow children to fill available space
   */
  grow?: boolean;

  /**
   * Additional props to pass to the Group component
   */
  [key: string]: any;
}

/**
 * FormRow component for horizontal layout of form fields
 */
export function FormRow({
  children,
  spacing = 'md',
  align = 'flex-start',
  grow = true,
  ...props
}: FormRowProps) {
  return (
    <Group spacing={spacing} align={align} grow={grow} {...props}>
      {children}
    </Group>
  );
}

/**
 * Props for FormColumn component
 */
export interface FormColumnProps {
  /**
   * Children to render in the column
   */
  children: React.ReactNode;

  /**
   * Spacing between elements
   */
  spacing?: number | string;

  /**
   * Additional props to pass to the Stack component
   */
  [key: string]: any;
}

/**
 * FormColumn component for vertical layout of form fields
 */
export function FormColumn({
  children,
  spacing = 'md',
  ...props
}: FormColumnProps) {
  return (
    <Stack spacing={spacing} {...props}>
      {children}
    </Stack>
  );
}

'use client';

import React, { useMemo } from 'react';
import { Progress, Text, Stack, Group, Badge, ProgressProps } from '@mantine/core';
import { useFormContext } from '../core';
import { FormWithRegistry } from '../types';

/**
 * Props for FormProgress component
 */
export interface FormProgressProps extends Omit<ProgressProps, 'value'> {
  /**
   * Whether to show the percentage text
   * @default true
   */
  showPercentage?: boolean;

  /**
   * Whether to show the missing fields badge
   * @default true
   */
  showMissingFields?: boolean;

  /**
   * Label for the progress
   * @default "Form completion"
   */
  label?: string;

  /**
   * Custom render function for the progress
   */
  renderProgress?: (props: {
    percentage: number;
    missingFields: string[];
    form: FormWithRegistry<any>;
  }) => React.ReactNode;
}

/**
 * FormProgress component for showing form completion progress
 * This component calculates completion based on required fields in the registry
 */
export function FormProgress({
  showPercentage = true,
  showMissingFields = true,
  label = 'Form completion',
  renderProgress,
  ...progressProps
}: FormProgressProps) {
  const form = useFormContext();

  // Calculate completion percentage and missing fields
  const { completionPercentage, missingFields } = useMemo(() => {
    // Get all required fields from the registry
    const requiredFields = Object.entries(form.registry.fields)
      .filter(([_, config]) => config.required)
      .map(([name]) => name);

    if (requiredFields.length === 0) {
      return { completionPercentage: 100, missingFields: [] };
    }

    // Check which required fields are filled
    const missingFields = requiredFields.filter(field => {
      const value = form.getNestedValue(field);
      return value === undefined || value === null || value === '';
    });

    // Calculate percentage
    const completionPercentage = Math.round(
      ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
    );

    return { completionPercentage, missingFields };
  }, [form]);

  // If custom render function is provided, use it
  if (renderProgress) {
    return renderProgress({
      percentage: completionPercentage,
      missingFields,
      form
    });
  }

  return (
    <Stack spacing="xs">
      <Group position="apart">
        <Text size="sm">{label}: {showPercentage && `${completionPercentage}%`}</Text>
        {showMissingFields && missingFields.length > 0 && (
          <Badge color="red">{missingFields.length} required field(s) missing</Badge>
        )}
      </Group>
      <Progress
        value={completionPercentage}
        color={completionPercentage === 100 ? 'green' : 'blue'}
        {...progressProps}
      />
    </Stack>
  );
}

/**
 * Props for FormStepIndicator component
 */
export interface FormStepIndicatorProps {
  /**
   * Current step index (0-based)
   */
  currentStep: number;

  /**
   * Total number of steps
   */
  totalSteps: number;

  /**
   * Labels for each step
   */
  stepLabels?: string[];

  /**
   * Whether to show step labels
   * @default true
   */
  showLabels?: boolean;

  /**
   * Whether to show step numbers
   * @default true
   */
  showNumbers?: boolean;

  /**
   * Custom render function for the step indicator
   */
  renderStepIndicator?: (props: {
    currentStep: number;
    totalSteps: number;
    stepLabels?: string[];
  }) => React.ReactNode;
}

/**
 * FormStepIndicator component for showing multi-step form progress
 */
export function FormStepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  showLabels = true,
  showNumbers = true,
  renderStepIndicator
}: FormStepIndicatorProps) {
  // If custom render function is provided, use it
  if (renderStepIndicator) {
    return renderStepIndicator({
      currentStep,
      totalSteps,
      stepLabels
    });
  }

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Stack spacing="xs">
      <Progress value={progressPercentage} size="md" />
      {(showLabels || showNumbers) && (
        <Group position="apart">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={index}>
                {showNumbers && (
                  <Badge
                    color={isActive ? 'blue' : isCompleted ? 'green' : 'gray'}
                    size="sm"
                  >
                    {index + 1}
                  </Badge>
                )}
                {showLabels && stepLabels && stepLabels[index] && (
                  <Text
                    size="xs"
                    weight={isActive ? 'bold' : 'normal'}
                    color={isActive ? 'blue' : isCompleted ? 'green' : 'gray'}
                  >
                    {stepLabels[index]}
                  </Text>
                )}
              </div>
            );
          })}
        </Group>
      )}
    </Stack>
  );
}

/**
 * Props for FormValidationIndicator component
 */
export interface FormValidationIndicatorProps {
  /**
   * Whether to show the error count
   * @default true
   */
  showErrorCount?: boolean;

  /**
   * Whether to show the warning count
   * @default true
   */
  showWarningCount?: boolean;

  /**
   * Custom render function for the validation indicator
   */
  renderValidationIndicator?: (props: {
    errorCount: number;
    warningCount: number;
    form: FormWithRegistry<any>;
  }) => React.ReactNode;
}

/**
 * FormValidationIndicator component for showing form validation status
 */
export function FormValidationIndicator({
  showErrorCount = true,
  showWarningCount = true,
  renderValidationIndicator
}: FormValidationIndicatorProps) {
  const form = useFormContext();

  // Count errors and warnings
  const { errorCount, warningCount } = useMemo(() => {
    const errors = form.errors || {};
    const errorCount = Object.keys(errors).length;

    // Warnings would be implemented in a real system
    const warningCount = 0;

    return { errorCount, warningCount };
  }, [form]);

  // If custom render function is provided, use it
  if (renderValidationIndicator) {
    return renderValidationIndicator({
      errorCount,
      warningCount,
      form
    });
  }

  // If no errors or warnings, or not showing any, return null
  if ((!showErrorCount && !showWarningCount) ||
      (errorCount === 0 && warningCount === 0)) {
    return null;
  }

  return (
    <Group spacing="md">
      {showErrorCount && errorCount > 0 && (
        <Badge color="red">{errorCount} error(s)</Badge>
      )}
      {showWarningCount && warningCount > 0 && (
        <Badge color="yellow">{warningCount} warning(s)</Badge>
      )}
    </Group>
  );
}

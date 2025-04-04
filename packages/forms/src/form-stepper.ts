'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormStep, FormWithRegistry } from './types';

/**
 * Options for the form stepper hook
 */
export interface FormStepperOptions<T> {
  steps: FormStep<T>[];
  initialStep?: string;
  onStepChange?: (from: string, to: string, values: T) => void;
  validateOnStepChange?: boolean;
}

/**
 * Hook for managing multi-step forms
 *
 * This hook provides functionality for navigating between form steps,
 * validating each step, and tracking completion status.
 *
 * @example
 * ```tsx
 * const form = useFormWithRegistry({...});
 *
 * const {
 *   activeStep,
 *   nextStep,
 *   prevStep,
 *   goToStep,
 *   isFirstStep,
 *   isLastStep
 * } = useFormStepper(form, {
 *   steps: [
 *     {
 *       id: 'personal',
 *       title: 'Personal Information',
 *       fields: ['firstName', 'lastName', 'email'],
 *       validate: (values) => {
 *         // Custom validation for this step
 *         const errors: Record<string, string> = {};
 *         if (!values.email.includes('@')) {
 *           errors.email = 'Invalid email format';
 *         }
 *         return Object.keys(errors).length > 0 ? errors : null;
 *       }
 *     },
 *     {
 *       id: 'address',
 *       title: 'Address',
 *       fields: ['street', 'city', 'state', 'zip']
 *     }
 *   ]
 * });
 * ```
 */
export function useFormStepper<T>(
  form: FormWithRegistry<T>,
  options: FormStepperOptions<T>
) {
  // Sort steps by order if provided
  const sortedSteps = useMemo(() => {
    return [...options.steps].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return 0;
    });
  }, [options.steps]);

  // Initialize with the first step or the specified initial step
  const [activeStepId, setActiveStepId] = useState<string>(
    options.initialStep || (sortedSteps.length > 0 ? sortedSteps[0].id : '')
  );

  // Get the active step object
  const activeStep = useMemo(() =>
    sortedSteps.find(step => step.id === activeStepId),
    [activeStepId, sortedSteps]
  );

  // Get the index of the active step
  const activeStepIndex = useMemo(() =>
    sortedSteps.findIndex(step => step.id === activeStepId),
    [activeStepId, sortedSteps]
  );

  // Check if we're on the first or last step
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === sortedSteps.length - 1;

  // Get visible fields based on active step
  const visibleFields = useMemo(() =>
    activeStep ? activeStep.fields as string[] : [],
    [activeStep]
  );

  // Update form with step information
  useEffect(() => {
    if (form) {
      (form as any).currentStep = activeStep;
      (form as any).steps = sortedSteps;
      (form as any).isFirstStep = isFirstStep;
      (form as any).isLastStep = isLastStep;
    }
  }, [form, activeStep, sortedSteps, isFirstStep, isLastStep]);

  /**
   * Validate the current step
   */
  const validateCurrentStep = useCallback(() => {
    if (!activeStep) return true;

    // Get the current values
    const currentValues = form.getValues();

    // Custom step validation
    if (activeStep.validate) {
      const errors = activeStep.validate(currentValues);
      if (errors) {
        form.setErrors(errors);
        return false;
      }
    }

    // Skip validation if not required
    if (options.validateOnStepChange === false) {
      return true;
    }

    // Validate only the fields in this step
    const stepFields = activeStep.fields as string[];
    const stepValues = {} as any;

    // Extract only the values for fields in this step
    stepFields.forEach(field => {
      stepValues[field] = currentValues[field as keyof T];
    });

    // Validate using the form's validate function
    const errors = form.validate(stepValues);

    if (errors) {
      form.setErrors(errors);
      return false;
    }

    return true;
  }, [activeStep, form, options.validateOnStepChange]);

  /**
   * Move to the next step
   */
  const nextStep = useCallback(() => {
    // Validate current step first
    if (!validateCurrentStep()) {
      return false;
    }

    // Find the next step
    const nextIndex = activeStepIndex + 1;
    if (nextIndex < sortedSteps.length) {
      const nextStepId = sortedSteps[nextIndex].id;
      const prevStepId = activeStepId;

      // Call onStepChange if provided
      if (options.onStepChange) {
        options.onStepChange(prevStepId, nextStepId, form.getValues());
      }

      // Update active step
      setActiveStepId(nextStepId);
      return true;
    }

    return false;
  }, [activeStepId, activeStepIndex, form, options, sortedSteps, validateCurrentStep]);

  /**
   * Move to the previous step
   */
  const prevStep = useCallback(() => {
    // Find the previous step
    const prevIndex = activeStepIndex - 1;
    if (prevIndex >= 0) {
      const prevStepId = sortedSteps[prevIndex].id;
      const currentStepId = activeStepId;

      // Call onStepChange if provided
      if (options.onStepChange) {
        options.onStepChange(currentStepId, prevStepId, form.getValues());
      }

      // Update active step
      setActiveStepId(prevStepId);
      return true;
    }

    return false;
  }, [activeStepId, activeStepIndex, form, options, sortedSteps]);

  /**
   * Go to a specific step
   */
  const goToStep = useCallback((stepId: string) => {
    // Find the step
    const stepIndex = sortedSteps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) {
      return false;
    }

    // If going forward, validate all previous steps
    if (stepIndex > activeStepIndex) {
      // Validate current step
      if (!validateCurrentStep()) {
        return false;
      }

      // Skip validation of intermediate steps if not required
      if (options.validateOnStepChange !== false) {
        // Validate all steps in between
        for (let i = activeStepIndex + 1; i < stepIndex; i++) {
          const step = sortedSteps[i];
          if (step.validate) {
            const errors = step.validate(form.getValues());
            if (errors) {
              form.setErrors(errors);
              return false;
            }
          }
        }
      }
    }

    // Call onStepChange if provided
    if (options.onStepChange) {
      options.onStepChange(activeStepId, stepId, form.getValues());
    }

    // Update active step
    setActiveStepId(stepId);
    return true;
  }, [activeStepId, activeStepIndex, form, options, sortedSteps, validateCurrentStep]);

  /**
   * Check if a step is complete
   */
  const isStepComplete = useCallback((stepId: string) => {
    const step = sortedSteps.find(s => s.id === stepId);
    if (!step) return false;

    // If the step has a custom completion check, use that
    if (step.isComplete) {
      return step.isComplete(form.getValues());
    }

    // Otherwise, check if all required fields have values
    const values = form.getValues();
    const stepFields = step.fields as string[];

    for (const field of stepFields) {
      const fieldConfig = form.registry.getField(field);
      if (fieldConfig?.required) {
        const value = form.getNestedValue(field);
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
    }

    return true;
  }, [form, sortedSteps]);

  /**
   * Get the completion percentage of the form
   */
  const getCompletionPercentage = useCallback(() => {
    const totalSteps = sortedSteps.length;
    if (totalSteps === 0) return 0;

    const completedSteps = sortedSteps.filter(step => isStepComplete(step.id)).length;
    return Math.round((completedSteps / totalSteps) * 100);
  }, [isStepComplete, sortedSteps]);

  return {
    activeStep,
    activeStepId,
    activeStepIndex,
    visibleFields,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    isStepComplete,
    getCompletionPercentage,
    steps: sortedSteps
  };
}

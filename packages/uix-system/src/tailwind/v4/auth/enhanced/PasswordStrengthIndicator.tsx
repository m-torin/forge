/**
 * Tailwind v4 RSC Password Strength Indicator
 * 100% React Server Component for real-time password strength analysis
 */

'use client';

import { useEffect, useState } from 'react';
import type { BaseProps } from '../types';
import { cn } from '../utils/dark-mode';

interface PasswordStrengthIndicatorProps extends BaseProps {
  password: string;
  minLength?: number;
  showRequirements?: boolean;
  showSuggestions?: boolean;
  customRules?: PasswordRule[];
  onStrengthChange?: (strength: PasswordStrength) => void;
}

interface PasswordRule {
  id: string;
  name: string;
  description: string;
  test: (password: string) => boolean;
  weight: number; // 1-10, higher means more important
}

interface PasswordStrength {
  score: number; // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  passedRules: string[];
  failedRules: string[];
  suggestions: string[];
}

const defaultRules: PasswordRule[] = [
  {
    id: 'length',
    name: 'Length',
    description: 'At least 8 characters',
    test: password => password.length >= 8,
    weight: 10,
  },
  {
    id: 'lowercase',
    name: 'Lowercase',
    description: 'At least one lowercase letter',
    test: password => /[a-z]/.test(password),
    weight: 6,
  },
  {
    id: 'uppercase',
    name: 'Uppercase',
    description: 'At least one uppercase letter',
    test: password => /[A-Z]/.test(password),
    weight: 6,
  },
  {
    id: 'numbers',
    name: 'Numbers',
    description: 'At least one number',
    test: password => /\d/.test(password),
    weight: 7,
  },
  {
    id: 'symbols',
    name: 'Symbols',
    description: 'At least one special character',
    test: password => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    weight: 8,
  },
  {
    id: 'no-common',
    name: 'Not Common',
    description: 'Not a common password',
    test: password => !isCommonPassword(password),
    weight: 9,
  },
  {
    id: 'no-sequential',
    name: 'No Sequences',
    description: 'No obvious sequences (123, abc)',
    test: password => !hasSequentialChars(password),
    weight: 7,
  },
  {
    id: 'no-repeated',
    name: 'No Repetition',
    description: 'No excessive character repetition',
    test: password => !hasExcessiveRepetition(password),
    weight: 5,
  },
];

// Common passwords list (simplified for demo)
const commonPasswords = new Set([
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  '12345678',
  'monkey',
  'dragon',
  'princess',
  'sunshine',
  'master',
  'shadow',
  'football',
  'baseball',
]);

function isCommonPassword(password: string): boolean {
  return commonPasswords.has(password.toLowerCase());
}

function hasSequentialChars(password: string): boolean {
  const sequential = [
    '123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ];

  const lower = password.toLowerCase();
  return sequential.some(seq => {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lower.includes(seq.slice(i, i + 3))) return true;
    }
    return false;
  });
}

function hasExcessiveRepetition(password: string): boolean {
  const repeatedChar = /(.)\1{2,}/.test(password); // 3+ same chars in a row
  const repeatedPattern = /(.{2,})\1{2,}/.test(password); // 3+ repeated patterns
  return repeatedChar || repeatedPattern;
}

function analyzePassword(password: string, rules: PasswordRule[]): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      level: 'very-weak',
      passedRules: [],
      failedRules: rules.map(r => r.id),
      suggestions: ['Enter a password to see strength analysis'],
    };
  }

  const passedRules: string[] = [];
  const failedRules: string[] = [];
  let totalWeight = 0;
  let passedWeight = 0;

  // Test each rule
  rules.forEach(rule => {
    totalWeight += rule.weight;
    if (rule.test(password)) {
      passedRules.push(rule.id);
      passedWeight += rule.weight;
    } else {
      failedRules.push(rule.id);
    }
  });

  // Calculate score (0-100)
  const score = Math.round((passedWeight / totalWeight) * 100);

  // Determine level
  let level: PasswordStrength['level'];
  if (score < 20) level = 'very-weak';
  else if (score < 40) level = 'weak';
  else if (score < 60) level = 'fair';
  else if (score < 80) level = 'good';
  else level = 'strong';

  // Generate suggestions
  const suggestions = generateSuggestions(password, failedRules, rules);

  return { score, level, passedRules, failedRules, suggestions };
}

function generateSuggestions(
  password: string,
  failedRules: string[],
  _rules: PasswordRule[],
): string[] {
  const suggestions: string[] = [];

  if (failedRules.includes('length')) {
    suggestions.push('Make your password at least 8 characters long');
  }
  if (failedRules.includes('lowercase')) {
    suggestions.push('Add lowercase letters (a-z)');
  }
  if (failedRules.includes('uppercase')) {
    suggestions.push('Add uppercase letters (A-Z)');
  }
  if (failedRules.includes('numbers')) {
    suggestions.push('Include at least one number (0-9)');
  }
  if (failedRules.includes('symbols')) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }
  if (failedRules.includes('no-common')) {
    suggestions.push('Avoid common passwords like "password" or "123456"');
  }
  if (failedRules.includes('no-sequential')) {
    suggestions.push('Avoid sequential characters like "123" or "abc"');
  }
  if (failedRules.includes('no-repeated')) {
    suggestions.push('Avoid repeating characters or patterns');
  }

  if (password.length > 0 && suggestions.length === 0) {
    suggestions.push('Great password! Consider using a password manager.');
  }

  return suggestions;
}

export function PasswordStrengthIndicator({
  password,
  minLength = 8,
  showRequirements = true,
  showSuggestions = true,
  customRules,
  onStrengthChange,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);

  const rules =
    customRules ||
    defaultRules.map(rule =>
      rule.id === 'length' ? { ...rule, test: pwd => pwd.length >= minLength } : rule,
    );

  useEffect(() => {
    const newStrength = analyzePassword(password, rules);
    setStrength(newStrength);

    if (onStrengthChange) {
      onStrengthChange(newStrength);
    }
  }, [password, rules, onStrengthChange]);

  if (!strength) return null;

  const getStrengthColor = (level: PasswordStrength['level']) => {
    switch (level) {
      case 'very-weak':
        return cn(
          'text-red-600 bg-red-50 border-red-200',
          'dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
        );
      case 'weak':
        return cn(
          'text-orange-600 bg-orange-50 border-orange-200',
          'dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800',
        );
      case 'fair':
        return cn(
          'text-yellow-600 bg-yellow-50 border-yellow-200',
          'dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800',
        );
      case 'good':
        return cn(
          'text-blue-600 bg-blue-50 border-blue-200',
          'dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
        );
      case 'strong':
        return cn(
          'text-green-600 bg-green-50 border-green-200',
          'dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
        );
    }
  };

  const getStrengthBarColor = (level: PasswordStrength['level']) => {
    switch (level) {
      case 'very-weak':
        return cn('bg-red-500', 'dark:bg-red-500');
      case 'weak':
        return cn('bg-orange-500', 'dark:bg-orange-500');
      case 'fair':
        return cn('bg-yellow-500', 'dark:bg-yellow-500');
      case 'good':
        return cn('bg-blue-500', 'dark:bg-blue-500');
      case 'strong':
        return cn('bg-green-500', 'dark:bg-green-500');
    }
  };

  const strengthLabel = {
    'very-weak': 'Very Weak',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={cn('text-sm font-medium text-gray-700', 'dark:text-gray-300')}>
            Password Strength
          </span>
          <div className="flex items-center space-x-2">
            <span className={cn('text-sm text-gray-600', 'dark:text-gray-400')}>
              {strength.score}%
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStrengthColor(strength.level)}`}
            >
              {strengthLabel[strength.level]}
            </span>
          </div>
        </div>

        <div className={cn('h-2 w-full rounded-full bg-gray-200', 'dark:bg-gray-700')}>
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor(strength.level)}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {showRequirements && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Requirements</h4>
          <div className="space-y-2">
            {rules.map(rule => {
              const isPassed = strength.passedRules.includes(rule.id);
              return (
                <div key={rule.id} className="flex items-center space-x-2">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      isPassed ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {isPassed ? (
                      <svg
                        className="h-3 w-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-3 w-3 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${isPassed ? 'text-green-700' : 'text-gray-600'}`}>
                    {rule.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showSuggestions && strength.suggestions.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Suggestions</h4>
          <div className="space-y-1">
            {strength.suggestions.map(suggestion => (
              <div key={suggestion} className="flex items-start space-x-2">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-600">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {strength.level === 'strong' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-start">
            <svg
              className="mr-3 mt-0.5 h-5 w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-green-800">
              <p className="mb-1 font-medium">Excellent password!</p>
              <p>
                Consider using a password manager to generate and store unique passwords for each
                account.
              </p>
            </div>
          </div>
        </div>
      )}

      {strength.level === 'very-weak' && password.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start">
            <svg
              className="mr-3 mt-0.5 h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-red-800">
              <p className="mb-1 font-medium">This password is too weak</p>
              <p>
                Weak passwords can be easily guessed or cracked. Please follow the suggestions
                above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

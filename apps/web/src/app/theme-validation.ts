import theme from './theme';

// Theme validation utility for Mantine v8 compliance

interface ValidationResult {
  issues: string[];
  isValid: boolean;
  warnings: string[];
}

export function validateTheme(): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check required properties
  if (!theme.colors || typeof theme.colors !== 'object') {
    issues.push('Missing or invalid colors configuration');
  }

  if (!theme.primaryColor || typeof theme.primaryColor !== 'string') {
    issues.push('Missing or invalid primaryColor');
  }

  if (!theme.breakpoints || typeof theme.breakpoints !== 'object') {
    issues.push('Missing or invalid breakpoints configuration');
  }

  // Validate color scales
  if (theme.colors) {
    const colorKeys = ['brand', 'gray', 'neutral', 'primary', 'secondary'];
    colorKeys.forEach(key => {
      const colors = theme.colors[key];
      if (colors && Array.isArray(colors)) {
        if (colors.length !== 10) {
          warnings.push(`Color scale "${key}" should have exactly 10 colors, has ${colors.length}`);
        }
        colors.forEach((color, index) => {
          if (typeof color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(color)) {
            issues.push(`Invalid color format in "${key}[${index}]": ${color}`);
          }
        });
      }
    });
  }

  // Validate component overrides
  if (theme.components) {
    const componentKeys = Object.keys(theme.components);
    componentKeys.forEach(key => {
      const component = theme.components![key];
      if (component && typeof component !== 'object') {
        issues.push(`Invalid component configuration for ${key}`);
      }
    });
  }

  // Check Mantine v8 specific features
  if (theme.autoContrast !== undefined && typeof theme.autoContrast !== 'boolean') {
    issues.push('autoContrast should be boolean');
  }

  if (theme.respectReducedMotion !== undefined && typeof theme.respectReducedMotion !== 'boolean') {
    issues.push('respectReducedMotion should be boolean');
  }

  if (theme.focusRing && !['always', 'auto', 'never'].includes(theme.focusRing)) {
    issues.push('focusRing should be "auto", "always", or "never"');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

// Color contrast validation
export function validateColorContrast(): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check if primary colors have sufficient contrast
  if (theme.colors?.brand) {
    const lightColors = theme.colors.brand.slice(0, 5); // 50-400
    const darkColors = theme.colors.brand.slice(5); // 500-900
    
    if (lightColors.length === 0 || darkColors.length === 0) {
      warnings.push('Primary color scale may not provide sufficient contrast range');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

// Tailwind alignment validation
export function validateTailwindAlignment(): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check if breakpoints match Tailwind
  const expectedBreakpoints = {
    lg: '75em',
    md: '62em', 
    sm: '48em',
    xl: '88em',
    xs: '36em',
  };

  if (theme.breakpoints) {
    Object.entries(expectedBreakpoints).forEach(([key, value]) => {
      if (theme.breakpoints![key] !== value) {
        issues.push(`Breakpoint "${key}" should be "${value}", got "${theme.breakpoints![key]}"`);
      }
    });
  }

  // Check if primary shade aligns with Tailwind defaults
  if (theme.primaryShade) {
    const { dark, light } = theme.primaryShade;
    if (light !== 6) {
      warnings.push(`Primary light shade is ${light}, Tailwind default is 6 (blue-600)`);
    }
    if (dark !== 4) {
      warnings.push(`Primary dark shade is ${dark}, Tailwind default is 4 (blue-400)`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

// Performance validation
export function validatePerformance(): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for potential performance issues
  if (theme.components) {
    const componentCount = Object.keys(theme.components).length;
    if (componentCount > 20) {
      warnings.push(`Large number of component overrides (${componentCount}) may impact performance`);
    }

    // Check for complex selectors
    Object.entries(theme.components).forEach(([componentName, config]) => {
      if (config && typeof config === 'object' && 'styles' in config) {
        const styles = config.styles as any;
        if (styles && typeof styles === 'object') {
          Object.values(styles).forEach((styleObj: any) => {
            if (styleObj && typeof styleObj === 'object') {
              Object.keys(styleObj).forEach(selector => {
                if (selector.includes('[data-mantine-color-scheme="dark"]') && selector.length > 50) {
                  warnings.push(`Complex selector in ${componentName} may impact performance: ${selector.substring(0, 50)}...`);
                }
              });
            }
          });
        }
      }
    });
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

// Complete validation suite
export function runCompleteValidation(): {
  overall: ValidationResult;
  theme: ValidationResult;
  contrast: ValidationResult;
  tailwind: ValidationResult;
  performance: ValidationResult;
} {
  const themeValidation = validateTheme();
  const contrastValidation = validateColorContrast();
  const tailwindValidation = validateTailwindAlignment();
  const performanceValidation = validatePerformance();

  const allIssues = [
    ...themeValidation.issues,
    ...contrastValidation.issues,
    ...tailwindValidation.issues,
    ...performanceValidation.issues,
  ];

  const allWarnings = [
    ...themeValidation.warnings,
    ...contrastValidation.warnings,
    ...tailwindValidation.warnings,
    ...performanceValidation.warnings,
  ];

  return {
    contrast: contrastValidation,
    overall: {
      isValid: allIssues.length === 0,
      issues: allIssues,
      warnings: allWarnings,
    },
    performance: performanceValidation,
    tailwind: tailwindValidation,
    theme: themeValidation,
  };
}
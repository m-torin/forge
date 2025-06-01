import { cn as nativeWindCn } from '@gluestack-ui/nativewind-utils/cn';

// Re-export the official Gluestack UI NativeWind cn utility
export const cn = nativeWindCn;

// Additional utility functions
export function cva(
  base: string,
  config?: {
    variants?: Record<string, Record<string, string>>;
    defaultVariants?: Record<string, string>;
  }
) {
  return (props?: Record<string, any>) => {
    if (!config) return base;

    const { variants, defaultVariants } = config;
    let classNames = base;

    if (variants && (props || defaultVariants)) {
      Object.keys(variants).forEach((variantKey) => {
        const variantValue = props?.[variantKey] || defaultVariants?.[variantKey];
        if (variantValue && variants[variantKey][variantValue]) {
          classNames = cn(classNames, variants[variantKey][variantValue]);
        }
      });
    }

    // Handle className prop
    if (props?.className) {
      classNames = cn(classNames, props.className);
    }

    return classNames;
  };
}
import { createTheme, rem } from "@mantine/core";

// RGB to Hex converter helper
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

// Color scales extracted from Tailwind CSS to match exactly
const primaryColors: [string, string, string, string, string, string, string, string, string, string] = [
  rgbToHex(240, 249, 255), // primary-50
  rgbToHex(224, 242, 254), // primary-100  
  rgbToHex(186, 230, 253), // primary-200
  rgbToHex(125, 211, 252), // primary-300
  rgbToHex(56, 189, 248),  // primary-400
  rgbToHex(14, 165, 233),  // primary-500
  rgbToHex(2, 132, 199),   // primary-600
  rgbToHex(3, 105, 161),   // primary-700
  rgbToHex(7, 89, 133),    // primary-800
  rgbToHex(12, 74, 110),   // primary-900
];

const secondaryColors: [string, string, string, string, string, string, string, string, string, string] = [
  rgbToHex(240, 253, 244), // secondary-50
  rgbToHex(220, 252, 231), // secondary-100
  rgbToHex(187, 247, 208), // secondary-200
  rgbToHex(134, 239, 172), // secondary-300
  rgbToHex(74, 222, 128),  // secondary-400
  rgbToHex(34, 197, 94),   // secondary-500
  rgbToHex(22, 163, 74),   // secondary-600
  rgbToHex(21, 128, 61),   // secondary-700
  rgbToHex(22, 101, 52),   // secondary-800
  rgbToHex(20, 83, 45),    // secondary-900
];

const neutralColors: [string, string, string, string, string, string, string, string, string, string] = [
  rgbToHex(249, 250, 251), // neutral-50
  rgbToHex(243, 244, 246), // neutral-100
  rgbToHex(229, 231, 235), // neutral-200
  rgbToHex(209, 213, 219), // neutral-300
  rgbToHex(156, 163, 175), // neutral-400
  rgbToHex(107, 114, 128), // neutral-500
  rgbToHex(75, 85, 99),    // neutral-600
  rgbToHex(55, 65, 81),    // neutral-700
  rgbToHex(31, 41, 55),    // neutral-800
  rgbToHex(17, 24, 39),    // neutral-900
];

const theme = createTheme({
  // Match Tailwind breakpoints exactly
  breakpoints: {
    lg: "75em",  // 1200px
    md: "62em",  // 992px
    sm: "48em",  // 768px  
    xl: "88em",  // 1408px
    xs: "36em",  // 576px
  },

  // Color system matching Tailwind exactly
  colors: {
    // Standard Tailwind color mappings
    blue: primaryColors,  // Most blue-xxx classes map to primary
    // Map primary colors to 'brand' for Mantine
    brand: primaryColors,
    // Map neutral colors to 'gray' 
    gray: neutralColors,
    // Map secondary colors to 'green'
    green: secondaryColors,
    neutral: neutralColors,
    // Keep primary/secondary/neutral as well for flexibility
    primary: primaryColors,
    secondary: secondaryColors,
    slate: neutralColors, // Some neutral-xxx classes 
  },

  // Primary color for Mantine components (shade 6 matches bg-blue-600)
  primaryColor: 'brand',
  primaryShade: { dark: 4, light: 6 }, // Aligns with bg-blue-600/400

  black: neutralColors[8], // text-gray-900 equivalent
  // White and black matching Tailwind
  white: '#ffffff',

  // Border radius matching Tailwind exactly - using rem() for better scaling
  defaultRadius: 'md', // rounded-md is the most common
  radius: {
    lg: rem(8),      // rounded-lg (8px)
    md: rem(6),      // rounded-md (6px) - primary default
    sm: rem(4),      // rounded (4px) 
    xl: rem(12),     // rounded-xl (12px)
    xs: rem(2),      // rounded-sm (2px)
  },

  // Shadow system matching Tailwind
  shadows: {
    lg: '2px 8px 40px rgba(0, 0, 0, 0.08)', // nc-shadow-lg from styles.css
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // shadow-sm
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },

  // Typography matching Tailwind exactly - using rem() for accessibility
  fontSizes: {
    lg: rem(18),     // text-lg (18px)
    md: rem(16),     // text-base (16px)
    sm: rem(14),     // text-sm (14px) - most common
    xl: rem(20),     // text-xl (20px)
    xs: rem(12),     // text-xs (12px)
  },

  fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
  
  lineHeights: {
    lg: '1.625',    // leading-relaxed
    md: '1.5',      // leading-normal
    sm: '1.25',     // leading-tight
    xl: '1.75',     // leading-loose
    xs: '1',        // leading-none
  },

  // Spacing scale matching Tailwind exactly - using rem() for consistency
  spacing: {
    lg: rem(24),    // 24px (space-6)
    md: rem(16),    // 16px (space-4)
    sm: rem(12),    // 12px (space-3)
    xl: rem(32),    // 32px (space-8)
    xs: rem(8),     // 8px (space-2)
  },

  // Component-specific overrides to match Tailwind styling exactly
  components: {
    Button: {
      defaultProps: {
        radius: 'md',    // rounded-md default
        size: 'sm',      // matches h-10
        variant: 'filled',
      },
      styles: {
        root: {
          fontSize: rem(14),             // text-sm
          fontWeight: 500,               // font-medium
          // Base button styling matching .btn class
          height: rem(40),               // h-10 (40px)
          transition: 'colors 0.15s ease-in-out',
          
          // Focus visible styles matching Tailwind
          '&:focus-visible': {
            boxShadow: `0 0 0 2px ${primaryColors[5]}, 0 0 0 4px rgba(14, 165, 233, 0.1)`,
            outline: 'none',
          },
          
          // Disabled state matching Tailwind
          '&:disabled': {
            opacity: 0.5,
            pointerEvents: 'none',
          },
          
          // Variant-specific colors matching Tailwind classes
          '&[data-variant="filled"]': {
            '&:hover': {
              backgroundColor: primaryColors[7], // hover:bg-blue-700
            },
            backgroundColor: primaryColors[6], // bg-blue-600
            color: '#ffffff',
          },
          
          '&[data-variant="light"]': {
            '&:hover': {
              backgroundColor: neutralColors[2], // hover:bg-gray-300
            },
            backgroundColor: neutralColors[1], // bg-gray-200
            color: neutralColors[8],           // text-gray-900
          },
          
          '&[data-variant="subtle"]': {
            '&:hover': {
              backgroundColor: neutralColors[0], // hover:bg-gray-100
            },
            backgroundColor: 'transparent',
            color: neutralColors[8],           // text-gray-900
          },
          
          '&[data-variant="outline"]': {
            '&:hover': {
              backgroundColor: neutralColors[0], // hover:bg-gray-100
            },
            backgroundColor: 'transparent',
            border: `1px solid ${neutralColors[2]}`, // border-gray-300
            color: neutralColors[8],           // text-gray-900
          },
        },
        
        inner: {
          gap: rem(8), // space-2
        },
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'md',   // rounded-md
        size: 'sm',     // h-10 equivalent
      },
      styles: {
        input: {
          backgroundColor: 'transparent',
          borderColor: neutralColors[2], // border-gray-300
          fontSize: rem(14),             // text-sm
          // Base input styling matching .input class
          height: rem(40),               // h-10 (40px)
          padding: `${rem(8)} ${rem(12)}`, // px-3 py-2
          
          // Placeholder styling
          '&::placeholder': {
            color: neutralColors[4],       // placeholder:text-gray-500
          },
          
          // Focus state matching Tailwind
          '&:focus': {
            borderColor: primaryColors[5],
            boxShadow: `0 0 0 2px ${primaryColors[5]}, 0 0 0 4px rgba(14, 165, 233, 0.1)`,
            outline: 'none',
          },
          
          // Disabled state
          '&:disabled': {
            backgroundColor: neutralColors[1], // disabled:bg-gray-200
            cursor: 'not-allowed',
            opacity: 0.5,
          },
          
          // Dark mode support
          '[data-mantine-color-scheme="dark"] &': {
            backgroundColor: neutralColors[8],  // dark:bg-neutral-900
            borderColor: neutralColors[6],      // dark:border-neutral-700
            color: neutralColors[0],            // dark:text-neutral-100
            
            '&::placeholder': {
              color: neutralColors[5],           // dark:placeholder:text-neutral-400
            },
          },
        },
      },
    },
    
    NumberInput: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: 'transparent',
          borderColor: neutralColors[2],
          fontSize: '0.875rem',
          height: '2.5rem',
          
          '&:focus': {
            borderColor: primaryColors[5],
            boxShadow: `0 0 0 2px ${primaryColors[5]}, 0 0 0 4px rgba(14, 165, 233, 0.1)`,
            outline: 'none',
          },
        },
      },
    },
    
    Textarea: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: 'transparent',
          borderColor: neutralColors[2],
          fontSize: '0.875rem',
          
          '&:focus': {
            borderColor: primaryColors[5],
            boxShadow: `0 0 0 2px ${primaryColors[5]}, 0 0 0 4px rgba(14, 165, 233, 0.1)`,
            outline: 'none',
          },
        },
      },
    },
    
    Select: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        input: {
          backgroundColor: 'transparent',
          borderColor: neutralColors[2],
          fontSize: '0.875rem',
          height: '2.5rem',
          
          '&:focus': {
            borderColor: primaryColors[5],
            boxShadow: `0 0 0 2px ${primaryColors[5]}, 0 0 0 4px rgba(14, 165, 233, 0.1)`,
            outline: 'none',
          },
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: 'lg',   // rounded-lg
        shadow: 'sm',   // shadow-sm
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: neutralColors[1], // border-gray-200
          color: neutralColors[8],       // text-gray-900
          
          // Dark mode support
          '[data-mantine-color-scheme="dark"] &': {
            backgroundColor: neutralColors[8], // dark:bg-neutral-900
            borderColor: neutralColors[6],     // dark:border-neutral-700
            color: neutralColors[0],           // dark:text-neutral-100
          },
        },
      },
    },

    Card: {
      defaultProps: {
        padding: 'xl',    // p-6 equivalent (24px)
        radius: 'lg',     // rounded-lg
        shadow: 'sm',     // shadow-sm
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: neutralColors[1], // border-gray-200
          color: neutralColors[8],       // text-gray-900
          
          // Dark mode support
          '[data-mantine-color-scheme="dark"] &': {
            backgroundColor: neutralColors[8], // dark:bg-neutral-900
            borderColor: neutralColors[6],     // dark:border-neutral-700
            color: neutralColors[0],           // dark:text-neutral-100
          },
        },
        
        section: {
          // Card sections should inherit text color
          color: 'inherit',
        },
      },
    },

    Title: {
      styles: {
        root: {
          color: neutralColors[8],       // text-gray-900
          fontWeight: 600,               // font-semibold
          letterSpacing: '-0.025em',     // tracking-tight
          lineHeight: 1,                 // leading-none
          
          // Dark mode
          '[data-mantine-color-scheme="dark"] &': {
            color: neutralColors[0],     // dark:text-neutral-100
          },
        },
      },
    },

    Text: {
      styles: {
        root: {
          // Default text color
          color: neutralColors[8],       // text-gray-900
          
          '&[data-size="lg"]': {
            fontSize: '1.125rem',        // text-lg
          },
          '&[data-size="md"]': {
            fontSize: '1rem',            // text-base
          },
          '&[data-size="sm"]': {
            color: neutralColors[4],     // text-gray-500 for descriptions
            fontSize: '0.875rem',        // text-sm
          },
          '&[data-size="xl"]': {
            fontSize: '1.25rem',         // text-xl
          },
          // Size-specific styling
          '&[data-size="xs"]': {
            fontSize: '0.75rem',         // text-xs
          },
          
          // Dark mode support
          '[data-mantine-color-scheme="dark"] &': {
            color: neutralColors[0],     // dark:text-neutral-100
            
            '&[data-size="sm"]': {
              color: neutralColors[3],   // dark:text-neutral-400
            },
          },
        },
      },
    },

    Modal: {
      defaultProps: {
        centered: true,
        radius: 'lg',    // rounded-lg
        shadow: 'lg',    // shadow-lg
      },
      styles: {
        content: {
          backgroundColor: '#ffffff',
          
          '[data-mantine-color-scheme="dark"] &': {
            backgroundColor: neutralColors[8], // dark:bg-neutral-900
          },
        },
        header: {
          backgroundColor: 'transparent',
        },
        title: {
          fontSize: '1.125rem',  // text-lg
          fontWeight: 600,
        },
      },
    },

    Popover: {
      defaultProps: {
        radius: 'md',    // rounded-md
        shadow: 'md',    // shadow-md
      },
      styles: {
        dropdown: {
          backgroundColor: '#ffffff',
          borderColor: neutralColors[1],
          
          '[data-mantine-color-scheme="dark"] &': {
            backgroundColor: neutralColors[8],
            borderColor: neutralColors[6],
          },
        },
      },
    },
    
    Menu: {
      defaultProps: {
        radius: 'md',
        shadow: 'md',
      },
      styles: {
        dropdown: {
          backgroundColor: '#ffffff',
          borderColor: neutralColors[1],
          
          '[data-mantine-color-scheme="dark"] &': {
            backgroundColor: neutralColors[8],
            borderColor: neutralColors[6],
          },
        },
        item: {
          fontSize: '0.875rem', // text-sm
          
          '&[data-hovered]': {
            backgroundColor: neutralColors[0], // hover:bg-gray-100
          },
          
          '[data-mantine-color-scheme="dark"] &': {
            '&[data-hovered]': {
              backgroundColor: neutralColors[7], // dark:hover:bg-neutral-700
            },
          },
        },
      },
    },
    
    Tooltip: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        tooltip: {
          backgroundColor: neutralColors[8], // bg-gray-900
          color: '#ffffff',
          fontSize: '0.875rem', // text-sm
        },
      },
    },
  },

  // Default focus styles matching Tailwind
  focusRing: 'auto',
  
  // Mantine v8 specific configurations
  autoContrast: true,
  respectReducedMotion: true,
});

export default theme;

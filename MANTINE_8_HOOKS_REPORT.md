# Mantine 8 Hooks and Extensions Report

Based on the comprehensive documentation from Context7, here's a detailed report
on all Mantine 8 hooks and extensions:

## Core State Management Hooks

### useUncontrolled

- **Purpose**: Manages controlled/uncontrolled state patterns
- **Features**: Handles value, defaultValue, finalValue, and onChange
- **Returns**: `[currentValue, setValue, isControlled]`

### useToggle

- **Purpose**: Toggles between array of values (defaults to boolean)
- **Usage**: `useToggle(['light', 'dark'])` or `useToggle()` for boolean
- **Features**: Can force specific values or cycle through options

### useCounter

- **Purpose**: Counter state with increment/decrement/set/reset
- **Options**: min/max boundaries
- **Returns**: `[count, { increment, decrement, set, reset }]`

### useDisclosure

- **Purpose**: Boolean state with open/close/toggle handlers
- **Features**: Optional onOpen/onClose callbacks
- **Returns**: `[opened, { open, close, toggle }]`

### useValidatedState

- **Purpose**: State with validation and last valid value tracking
- **Features**: Tracks current value, last valid value, and validation status
- **Usage**: Form validation, input sanitization

## List and Collection Hooks

### useListState

- **Purpose**: Comprehensive array state management
- **Methods**: append, prepend, insert, remove, reorder, swap, apply, filter,
  setState, setItem, setItemProp, applyWhere
- **Returns**: `[values, handlers]`

### useSet

- **Purpose**: Manages Set data structure with React state
- **Features**: Provides Set methods that trigger re-renders

### useSelection

- **Purpose**: Manages selection state for lists/tables
- **Features**: select, deselect, toggle, isAllSelected, isSomeSelected,
  setSelection, resetSelection
- **Options**: resetSelectionOnDataChange

### usePagination

- **Purpose**: Pagination logic and state management
- **Features**: siblings, boundaries, page navigation
- **Returns**: range, active, setPage, next, previous, first, last

## Form and Input Hooks

### useField

- **Purpose**: Single input state management (simpler than useForm)
- **Features**: Built-in validation, getValue, setValue, getInputProps
- **Usage**: Alternative to full form management

### useFileDialog

- **Purpose**: File selection without traditional file input
- **Options**: multiple, accept, capture, directory, resetOnOpen
- **Features**: onChange, onCancel callbacks

### useClipboard

- **Purpose**: Copy text to clipboard with state tracking
- **Features**: Timeout for reset, error handling
- **Returns**: `{ copy, reset, error, copied }`

## DOM and Event Hooks

### useClickOutside

- **Purpose**: Detects clicks outside target element
- **Options**: Custom events, additional nodes to ignore
- **Returns**: ref to attach to target element

### useHotkeys

- **Purpose**: Keyboard shortcuts management
- **Features**: Key combinations, ignored tags (INPUT, TEXTAREA by default)
- **Usage**: `[['ctrl+K', callback]]`

### useEventListener

- **Purpose**: Adds event listeners to elements
- **Features**: Generic types for event handling
- **Returns**: ref callback for target element

### useFocusTrap

- **Purpose**: Traps focus within element
- **Features**: Conditional activation
- **Returns**: ref callback

### useFocusReturn

- **Purpose**: Returns focus to previously focused element
- **Options**: shouldReturnFocus flag
- **Usage**: Often used with useFocusTrap

### useWindowEvent

- **Purpose**: Simplified window event listeners
- **Features**: Abstracts addEventListener/removeEventListener

### useDocumentVisibility

- **Purpose**: Tracks document visibility state
- **Returns**: 'visible' | 'hidden'

### usePageLeave

- **Purpose**: Executes callback when user leaves page
- **Usage**: Cleanup, save data before navigation

## UI and Visual Hooks

### useHover

- **Purpose**: Tracks hover state of elements
- **Returns**: `{ hovered, ref }`

### useMove

- **Purpose**: Drag/move interactions with normalized coordinates
- **Features**: onScrubStart, onScrubEnd callbacks, RTL support
- **Returns**: `{ ref, active }`

### useRadialMove

- **Purpose**: Radial/circular movement interactions
- **Features**: Step-based value updates, custom callbacks
- **Usage**: Custom radial sliders

### useLongPress

- **Purpose**: Detects long press gestures
- **Options**: threshold, onStart, onFinish, onCancel
- **Returns**: Mouse and touch event handlers

### useInViewport

- **Purpose**: Detects if element is in viewport
- **Features**: Simpler alternative to useIntersection
- **Returns**: `{ inViewport, ref }`

### useElementSize

- **Purpose**: Tracks element dimensions
- **Features**: Uses ResizeObserver
- **Returns**: `{ ref, width, height }`

### useResizeObserver

- **Purpose**: Lower-level ResizeObserver wrapper
- **Returns**: `[ref, observerRect]`

## Advanced UI Hooks

### useModalsStack

- **Purpose**: Manages multiple modals with IDs
- **Features**: open, close, toggle, closeAll, register
- **Usage**: `useModalsStack(['modal1', 'modal2'])`

### useDrawersStack

- **Purpose**: Same as useModalsStack but for drawers
- **Features**: Identical API to useModalsStack

### useScrollSpy

- **Purpose**: Tracks scroll position relative to headings
- **Features**: Custom selectors, depth calculation, reinitialize
- **Returns**: `{ active, data, initialized, reinitialize }`

### useHeadroom

- **Purpose**: Hide/show headers based on scroll
- **Options**: fixedAt, onPin, onFix, onRelease
- **Returns**: boolean (should be pinned)

## Network and System Hooks

### useNetwork

- **Purpose**: Network connection information
- **Returns**: online, downlink, effectiveType, rtt, saveData, type

### useOs

- **Purpose**: Operating system detection
- **Returns**: 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'chromeos' |
  'undetermined'

### useColorScheme

- **Purpose**: Detects user's color scheme preference
- **Features**: Uses media query for prefers-color-scheme
- **Returns**: 'light' | 'dark'

### useReducedMotion

- **Purpose**: Detects user's motion preference
- **Features**: Uses prefers-reduced-motion media query
- **Returns**: boolean

## Utility and Timing Hooks

### useDebouncedValue

- **Purpose**: Debounces value changes
- **Options**: leading option for immediate first call
- **Returns**: `[debouncedValue, cancel]`

### useDebouncedCallback

- **Purpose**: Debounces function calls
- **Features**: Cancel functionality

### useTimeout

- **Purpose**: Delayed function execution
- **Features**: start, clear, autoInvoke option
- **Returns**: `{ start, clear }`

### useIdle

- **Purpose**: Detects user inactivity
- **Options**: Custom events, initialState
- **Returns**: boolean (is idle)

### useInterval

- **Purpose**: Recurring function execution
- **Features**: Auto-start option, start/stop control

## Mouse and Window Hooks

### useMouse

- **Purpose**: Mouse position tracking
- **Options**: resetOnExit
- **Returns**: `{ x, y, ref }`

### useWindowScroll

- **Purpose**: Window scroll position management
- **Features**: Smooth scrolling function
- **Returns**: `[position, scrollTo]`

### useMediaQuery

- **Purpose**: Media query state tracking
- **Options**: getInitialValueInEffect
- **Returns**: boolean (matches query)

## Utility Functions and Helpers

### useId

- **Purpose**: Generates stable unique IDs
- **Features**: Optional initial ID parameter
- **Returns**: string ID

### useMounted

- **Purpose**: Component mount state tracking
- **Returns**: boolean (is mounted)

### useDidUpdate

- **Purpose**: useEffect that skips initial mount
- **Features**: Only runs on updates, not mount

### useIsomorphicEffect

- **Purpose**: useLayoutEffect that works in SSR
- **Features**: Browser/server compatibility

### useShallowEffect

- **Purpose**: useEffect with shallow dependency comparison
- **Features**: Prevents unnecessary re-renders for object dependencies

## Text and Content Hooks

### useTextSelection

- **Purpose**: Tracks current text selection
- **Returns**: Selection | null

### useFavicon

- **Purpose**: Updates page favicon dynamically
- **Usage**: Client-side only

### useDocumentTitle

- **Purpose**: Updates document title
- **Features**: useLayoutEffect-based, ignores empty values

## Advanced State Hooks

### useStateHistory

- **Purpose**: State with undo/redo history
- **Features**: back, forward, reset functionality
- **Returns**: `[current, handlers, historyValue]`

### usePrevious

- **Purpose**: Stores previous value of state
- **Returns**: Previous value or undefined

### useEyeDropper

- **Purpose**: Browser EyeDropper API integration
- **Features**: Color picking from screen
- **Returns**: `{ supported, open }`

## Key Features Across All Hooks:

1. **TypeScript Support**: All hooks have comprehensive type definitions
2. **SSR Compatibility**: Most hooks handle server-side rendering appropriately
3. **Performance Optimized**: Efficient re-render patterns
4. **Accessibility**: Many hooks include ARIA and accessibility considerations
5. **Extensibility**: Configurable options for customization
6. **Browser Compatibility**: Graceful degradation for unsupported APIs

## Installation

```bash
# With npm
npm install @mantine/hooks

# With yarn
yarn add @mantine/hooks
```

## Usage Example

```tsx
import { useCounter, useHover, useClipboard } from "@mantine/hooks";

function MyComponent() {
  const [count, { increment, decrement }] = useCounter(0, { min: 0, max: 10 });
  const { hovered, ref } = useHover<HTMLDivElement>();
  const clipboard = useClipboard({ timeout: 2000 });

  return (
    <div ref={ref}>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <p>Hovered: {hovered ? "Yes" : "No"}</p>
      <button onClick={() => clipboard.copy("Hello World")}>
        {clipboard.copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}
```

## Summary

The Mantine 8 hooks package provides over 70 hooks covering virtually every
aspect of React state and UI management, from basic state operations to complex
interactions, form handling, and system integration. Each hook is designed with
TypeScript support, performance optimization, and developer experience in mind.

// Headless UI React library mock
import { vi } from 'vitest';
import { React } from './nextjs/shared';

vi.mock('@headlessui/react', () => {
  const createMockComponent = (displayName: string) => {
    const MockComponent = ({ children, ...props }: any) =>
      React.createElement(
        'div',
        { ...props, 'data-testid': `headlessui-${displayName.toLowerCase()}` },
        children,
      );
    MockComponent.displayName = displayName;
    return MockComponent;
  };

  return {
    Dialog: createMockComponent('Dialog'),
    Disclosure: createMockComponent('Disclosure'),
    Menu: createMockComponent('Menu'),
    Listbox: createMockComponent('Listbox'),
    Switch: createMockComponent('Switch'),
    Tab: createMockComponent('Tab'),
    Popover: createMockComponent('Popover'),
    RadioGroup: createMockComponent('RadioGroup'),
    Combobox: createMockComponent('Combobox'),
    Transition: createMockComponent('Transition'),
    Portal: createMockComponent('Portal'),
    FocusTrap: createMockComponent('FocusTrap'),
  };
});

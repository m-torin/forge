import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * A collection of links for navigating websites.
 */
const meta = {
  argTypes: {},
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
  },
  render: (args: any) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>Overview</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
              Documentation
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-96 p-2">
                <li>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    API Reference
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Getting Started
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Guides
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="https:www.google.com"
            className={navigationMenuTriggerStyle()}
            target="_blank"
          >
            External
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/NavigationMenu',
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the navigation menu.
 */
export const Default: Story = {
  args: {
    children: null,
  },
};

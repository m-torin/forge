import { Button } from "./button";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
  argTypes: {
    asChild: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
  },
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Button",
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    size: "default",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

export const IconButton: Story = {
  args: {
    "aria-label": "Search",
    children: "🔍",
    size: "icon",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

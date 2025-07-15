// src/components/MonacoEditor.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MonacoEditor } from './MonacoEditor';

const meta = {
  title: 'Components/MonacoEditor',
  component: MonacoEditor,
  tags: ['autodocs'],
} satisfies Meta<typeof MonacoEditor>;

export default meta;
type Story = StoryObj<typeof MonacoEditor>;

export const TypeScript: Story = {
  args: {
    language: 'typescript',
    defaultValue: `interface User {
  name: string;
  age: number;
}`,
    height: 300,
  },
};

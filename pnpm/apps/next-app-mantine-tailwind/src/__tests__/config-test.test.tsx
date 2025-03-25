import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import { Button } from '@mantine/core';

describe.skip('Mantine Configuration Test', () => {
  it('renders a Mantine button correctly', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});

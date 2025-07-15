import { describe, expect, test } from 'vitest';
import { createMockPrismaClient } from '../mocks/prisma-consolidated';
import { render, screen } from './render';

describe('testing Package Utilities', () => {
  describe('prisma Mock', () => {
    test('should create a mock Prisma client', () => {
      const client = createMockPrismaClient();
      expect(client).toBeDefined();
      expect(client.user).toBeDefined();
      expect(client.user.findUnique).toBeDefined();
    });
  });

  describe('render Utility', () => {
    test('should render a component with Mantine providers', () => {
      const TestComponent = () => <div data-testid="test">Hello</div>;
      render(<TestComponent />);
      expect(screen.getByTestId('test')).toHaveTextContent('Hello');
    });
  });
});

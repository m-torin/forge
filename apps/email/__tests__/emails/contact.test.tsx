import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ExampleContactEmail from '../../emails/contact';
import { ContactTemplate } from '@repo/email/templates/contact';

// Mock the ContactTemplate component
vi.mock('@repo/email/templates/contact', () => ({
  ContactTemplate: vi.fn(({ name, email, message }) => (
    <div data-testid="contact-template">
      <div data-testid="name">{name}</div>
      <div data-testid="email">{email}</div>
      <div data-testid="message">{message}</div>
    </div>
  )),
}));

describe.skip('ExampleContactEmail', () => {
  it('renders the ContactTemplate with the correct props', () => {
    const { getByTestId } = render(<ExampleContactEmail />);

    // Check that the ContactTemplate component was rendered
    expect(getByTestId('contact-template')).toBeInTheDocument();

    // Check that the ContactTemplate was called with the correct props
    expect(ContactTemplate).toHaveBeenCalledWith(
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        message: "I'm interested in your services.",
      },
      expect.anything(),
    );

    // Check that the props are correctly passed to the rendered component
    expect(getByTestId('name')).toHaveTextContent('Jane Smith');
    expect(getByTestId('email')).toHaveTextContent('jane.smith@example.com');
    expect(getByTestId('message')).toHaveTextContent(
      "I'm interested in your services.",
    );
  });

  it('renders with the expected structure', () => {
    const { container } = render(<ExampleContactEmail />);

    // The component should have a single root element
    expect(container.firstChild).toBeInTheDocument();

    // The root element should be the contact template
    expect(container.firstChild).toHaveAttribute(
      'data-testid',
      'contact-template',
    );
  });
});

import { ContactTemplate } from '@repo/email/templates/contact';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ContactTemplate', () => {
  const defaultProps = {
    email: 'test@example.com',
    name: 'John Doe',
    message: 'This is a test message',
  };

  it('should render with required props', () => {
    const { container } = render(<ContactTemplate {...defaultProps} />);

    expect(container.textContent).toContain('New email from John Doe');
    expect(container.textContent).toContain('test@example.com');
    expect(container.textContent).toContain('This is a test message');
  });

  it('should display sender information correctly', () => {
    const { container } = render(<ContactTemplate {...defaultProps} />);

    expect(container.textContent).toContain('John Doe (test@example.com) has sent you a message:');
  });

  it('should render message content', () => {
    const longMessage =
      'This is a very long message that should be displayed properly in the email template. It contains multiple sentences and should be formatted correctly.';
    const { container } = render(<ContactTemplate {...defaultProps} message={longMessage} />);

    expect(container.textContent).toContain(longMessage);
  });

  it('should handle special characters in message', () => {
    const specialMessage = 'Message with "quotes", <tags>, & symbols!';
    const { container } = render(<ContactTemplate {...defaultProps} message={specialMessage} />);

    expect(container.textContent).toContain(specialMessage);
  });

  it('should handle empty message', () => {
    const { container } = render(<ContactTemplate {...defaultProps} message="" />);

    expect(container.textContent).toContain('New email from John Doe');
    expect(container.textContent).toContain('John Doe (test@example.com) has sent you a message:');
  });
});

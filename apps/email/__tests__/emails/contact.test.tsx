import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ContactTemplate } from "@repo/email/templates/contact";

import ExampleContactEmail from "../../emails/contact";

import type { ComponentProps } from "react";

// Mock the ContactTemplate component
vi.mock("@repo/email/templates/contact", () => ({
  ContactTemplate: vi.fn(
    ({ name, email, message }: ComponentProps<typeof ContactTemplate>) => (
      <div data-testid="contact-template">
        <div data-testid="name">{name}</div>
        <div data-testid="email">{email}</div>
        <div data-testid="message">{message}</div>
      </div>
    ),
  ),
}));

describe("ExampleContactEmail", () => {
  beforeEach(() => {
    cleanup(); // Make sure to clean up between tests
  });

  it("renders the ContactTemplate with the correct props", () => {
    const { container } = render(<ExampleContactEmail />);

    // Check that the ContactTemplate component was called
    expect(ContactTemplate).toHaveBeenCalled();

    // Check that it was called with the correct props
    const callArgs = vi.mocked(ContactTemplate).mock.calls[0][0];
    expect(callArgs).toEqual({
      name: "Jane Smith",
      email: "jane.smith@example.com",
      message: "I'm interested in your services.",
    });

    // Check that the props are correctly passed to the rendered component
    const nameElement = container.querySelector('[data-testid="name"]');
    const emailElement = container.querySelector('[data-testid="email"]');
    const messageElement = container.querySelector('[data-testid="message"]');

    expect(nameElement?.textContent).toBe("Jane Smith");
    expect(emailElement?.textContent).toBe("jane.smith@example.com");
    expect(messageElement?.textContent).toBe("I'm interested in your services.");
  });

  it("renders with the expected structure", () => {
    const { container } = render(<ExampleContactEmail />);

    // Check that the contact template is in the document
    const contactTemplate = container.querySelector('[data-testid="contact-template"]');
    expect(contactTemplate).not.toBeNull();
  });
});

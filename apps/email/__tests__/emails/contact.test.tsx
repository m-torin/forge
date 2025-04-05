import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

describe.skip("ExampleContactEmail", () => {
  it("renders the ContactTemplate with the correct props", () => {
    render(<ExampleContactEmail />);

    // Check that the ContactTemplate component was rendered
    expect(screen.getByTestId("contact-template")).toBeInTheDocument();

    // Check that the ContactTemplate was called with the correct props
    expect(ContactTemplate).toHaveBeenCalledWith(
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        message: "I'm interested in your services.",
      },
      expect.anything(),
    );

    // Check that the props are correctly passed to the rendered component
    expect(screen.getByTestId("name")).toHaveTextContent("Jane Smith");
    expect(screen.getByTestId("email")).toHaveTextContent(
      "jane.smith@example.com",
    );
    expect(screen.getByTestId("message")).toHaveTextContent(
      "I'm interested in your services.",
    );
  });

  it("renders with the expected structure", () => {
    render(<ExampleContactEmail />);

    // Check that the contact template is in the document
    const contactTemplate = screen.getByTestId("contact-template");
    expect(contactTemplate).toBeInTheDocument();
  });
});

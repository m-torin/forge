// Import shared testing setup
import { vi } from "vitest";

// Add package-specific setup here

// Mock the keys module to provide consistent test values
vi.mock("../keys", () => {
  return {
    keys: vi.fn().mockImplementation(() => {
      // Check for valid email format in RESEND_FROM
      if (process.env.RESEND_FROM && !process.env.RESEND_FROM.includes("@")) {
        throw new Error("Invalid email format");
      }

      // Check that RESEND_TOKEN starts with 're_'
      if (
        process.env.RESEND_TOKEN &&
        !process.env.RESEND_TOKEN.startsWith("re_")
      ) {
        throw new Error("Invalid token format");
      }

      // Check for empty values
      if (process.env.RESEND_FROM === "") {
        throw new Error("RESEND_FROM cannot be empty");
      }

      if (process.env.RESEND_TOKEN === "") {
        throw new Error("RESEND_TOKEN cannot be empty");
      }

      return {
        RESEND_FROM: process.env.RESEND_FROM || "test@example.com",
        RESEND_TOKEN: process.env.RESEND_TOKEN || "re_test_token",
      };
    }),
  };
});

// Mock Resend
vi.mock("resend", () => {
  const mockSend = vi.fn().mockResolvedValue({
    id: "mock-email-id",
    from: "test@example.com",
    status: "success",
    subject: "Test Email",
    to: ["recipient@example.com"],
  });

  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

// Mock React Email Components
vi.mock("@react-email/components", () => {
  const createMockComponent = (name) => {
    const Component = ({ children, className, ...props }) => {
      return {
        type: "div",
        props: {
          "data-testid": `email-${name.toLowerCase()}`,
          children,
          className,
          ...props,
        },
      };
    };
    return Component;
  };

  return {
    Body: createMockComponent("Body"),
    Container: createMockComponent("Container"),
    Head: createMockComponent("Head"),
    Hr: createMockComponent("Hr"),
    Html: createMockComponent("Html"),
    Preview: createMockComponent("Preview"),
    Section: createMockComponent("Section"),
    Tailwind: createMockComponent("Tailwind"),
    Text: createMockComponent("Text"),
  };
});

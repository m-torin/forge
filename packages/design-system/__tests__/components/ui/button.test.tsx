import { describe, expect, it, vi } from "vitest";

// @ts-ignore - @repo/testing/vitest module may not be found during type checking
import { render, screen } from "@repo/testing/vitest";

import { Button, buttonVariants } from "../../../components/ui/button";

// Mock dependencies
vi.mock("@radix-ui/react-slot", () => ({
  Slot: ({ children, ...props }: any) => (
    <div data-testid="slot" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@repo/design-system/lib/utils", () => ({
  cn: (...inputs: any[]) => inputs.join(" "),
}));

describe("Button", () => {
  it("renders a button element by default", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });

  it("renders children correctly", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies the correct data-slot attribute", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("applies the default variant and size classes", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("default");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("destructive");
  });

  it("applies size classes correctly", () => {
    render(<Button size="lg">Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("lg");
  });

  it("renders as a Slot component when asChild is true", () => {
    render(<Button asChild>Click me</Button>);

    expect(screen.getByTestId("slot")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("passes additional props to the button element", () => {
    render(
      <Button aria-label="Test button" disabled>
        Click me
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-label", "Test button");
  });

  it("exports buttonVariants function", () => {
    expect(buttonVariants).toBeDefined();
    expect(typeof buttonVariants).toBe("function");

    // Test that buttonVariants returns a string
    const result = buttonVariants({ size: "default", variant: "default" });
    expect(typeof result).toBe("string");
  });
});

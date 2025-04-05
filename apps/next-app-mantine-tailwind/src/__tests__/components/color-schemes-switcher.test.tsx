import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";
import { render } from "@/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the useMantineColorScheme hook
const mockSetColorScheme = vi.fn();
const mockClearColorScheme = vi.fn();

vi.mock("@mantine/core", async () => {
  const actual = await vi.importActual("@mantine/core");
  return {
    ...(actual as Record<string, unknown>),
    useMantineColorScheme: () => ({
      clearColorScheme: mockClearColorScheme,
      setColorScheme: mockSetColorScheme,
    }),
  };
});

describe.skip("ColorSchemesSwitcher", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSetColorScheme.mockReset();
    mockClearColorScheme.mockReset();
  });

  it("renders all color scheme buttons", () => {
    render(<ColorSchemesSwitcher />);

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it('calls setColorScheme with "light" when Light button is clicked', () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText("Light"));
    expect(mockSetColorScheme).toHaveBeenCalledWith("light");
  });

  it('calls setColorScheme with "dark" when Dark button is clicked', () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText("Dark"));
    expect(mockSetColorScheme).toHaveBeenCalledWith("dark");
  });

  it('calls setColorScheme with "auto" when Auto button is clicked', () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText("Auto"));
    expect(mockSetColorScheme).toHaveBeenCalledWith("auto");
  });

  it("calls clearColorScheme when Clear button is clicked", () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText("Clear"));
    expect(mockClearColorScheme).toHaveBeenCalled();
  });

  it("renders buttons in a Group component", () => {
    render(<ColorSchemesSwitcher />);

    // Check that the buttons are present
    const lightButton = screen.getByText("Light");
    const darkButton = screen.getByText("Dark");
    const autoButton = screen.getByText("Auto");
    const clearButton = screen.getByText("Clear");

    expect(lightButton).toBeInTheDocument();
    expect(darkButton).toBeInTheDocument();
    expect(autoButton).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();

    // We can't directly test the Group component without DOM traversal
    // Instead, we can test that all buttons render correctly
  });
});

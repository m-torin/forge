import { RenderOptions, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";

// Export testing utilities
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, "queries">,
): RenderResult;

export function screen(): any;

export * from "@testing-library/react";

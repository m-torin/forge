"use client";

import { type LayoutType } from "./types";

interface LayoutSwitcherProps {
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;
}

const layoutOptions = [
  { type: "standard" as LayoutType, icon: "⚏", label: "Standard" },
  { type: "gallery" as LayoutType, icon: "⚏", label: "Gallery" },
  { type: "minimal" as LayoutType, icon: "⚏", label: "Minimal" },
  { type: "children" as LayoutType, icon: "🧸", label: "Kids" },
  { type: "showcase" as LayoutType, icon: "🖼️", label: "Showcase" },
] as const;

export function LayoutSwitcher({
  layoutType,
  setLayoutType,
}: LayoutSwitcherProps) {
  return (
    <div className="container mb-8">
      <div className="flex items-center justify-center gap-4 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-800">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Layout:
        </span>
        <div className="flex gap-1">
          {layoutOptions.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setLayoutType(type)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                layoutType === type
                  ? "bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

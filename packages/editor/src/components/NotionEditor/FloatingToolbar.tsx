"use client";

import { logInfo } from "@repo/observability";
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { clsx } from "clsx";
import { useCallback, useState } from "react";
import { HIGHLIGHT_COLORS, TEXT_COLORS } from "./constants";
import {
  HeadingDropdownMenu,
  ListDropdownMenu,
  TurnIntoDropdownMenu,
} from "./DropdownMenu";
import { LinkEditor } from "./LinkPreview";

interface FloatingToolbarProps {
  editor: Editor;
  showDropdowns?: boolean;
}

export function FloatingToolbar({
  editor,
  showDropdowns = true,
}: FloatingToolbarProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);

  const handleColorChange = useCallback(
    (color: string) => {
      editor.chain().focus().setColor(color).run();
      setIsColorPickerOpen(false);
    },
    [editor],
  );

  const handleHighlightChange = useCallback(
    (color: string | null) => {
      if (color) {
        editor.chain().focus().setHighlight({ color }).run();
      } else {
        editor.chain().focus().unsetHighlight().run();
      }
      setIsHighlightPickerOpen(false);
    },
    [editor],
  );

  const shouldShow = useCallback(({ editor }: { editor: Editor }) => {
    // Show when there's a text selection
    return !editor.state.selection.empty;
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      className="notion-floating-toolbar"
      data-testid="floating-toolbar"
      options={{
        placement: "top",
        offset: 8,
      }}
    >
      <div
        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        role="toolbar"
        aria-label="Text formatting toolbar"
      >
        {showDropdowns && (
          <>
            <TurnIntoDropdownMenu
              editor={editor}
              className="rounded-sm border-0 hover:bg-gray-50"
            />

            <div className="mx-1 h-6 w-px bg-gray-300" />

            <HeadingDropdownMenu
              editor={editor}
              className="rounded-sm border-0 hover:bg-gray-50"
            />

            <ListDropdownMenu
              editor={editor}
              className="rounded-sm border-0 hover:bg-gray-50"
            />

            <div className="mx-1 h-6 w-px bg-gray-300" />
          </>
        )}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx(
            "rounded p-2 transition-colors hover:bg-gray-100",
            editor.isActive("bold")
              ? "bg-gray-100 text-blue-600"
              : "text-gray-700",
          )}
          title="Bold (⌘B)"
        >
          <span className="text-sm font-bold">B</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(
            "rounded p-2 transition-colors hover:bg-gray-100",
            editor.isActive("italic")
              ? "bg-gray-100 text-blue-600"
              : "text-gray-700",
          )}
          title="Italic (⌘I)"
        >
          <span className="text-sm italic">I</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={clsx(
            "rounded p-2 transition-colors hover:bg-gray-100",
            editor.isActive("underline")
              ? "bg-gray-100 text-blue-600"
              : "text-gray-700",
          )}
          title="Underline (⌘U)"
        >
          <span className="text-sm underline">U</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={clsx(
            "rounded p-2 transition-colors hover:bg-gray-100",
            editor.isActive("strike")
              ? "bg-gray-100 text-blue-600"
              : "text-gray-700",
          )}
          title="Strikethrough"
        >
          <span className="text-sm line-through">S</span>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={clsx(
            "rounded p-2 transition-colors hover:bg-gray-100",
            editor.isActive("code")
              ? "bg-gray-100 text-blue-600"
              : "text-gray-700",
          )}
          title="Code (⌘E)"
        >
          <span className="font-mono text-sm">&lt;/&gt;</span>
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <div className="relative">
          <button
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="rounded p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Text Color"
          >
            <span className="text-sm">A</span>
            <div
              className="mt-0.5 h-0.5 w-full rounded"
              style={{
                backgroundColor:
                  editor.getAttributes("textStyle").color || "#000000",
              }}
            />
          </button>

          {isColorPickerOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              <div className="grid w-24 grid-cols-3 gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className="h-6 w-6 rounded border border-gray-300 transition-transform hover:scale-110"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsHighlightPickerOpen(!isHighlightPickerOpen)}
            className="rounded p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Highlight"
          >
            <span
              className="rounded px-1 text-sm"
              style={{
                backgroundColor:
                  editor.getAttributes("highlight").color || "transparent",
                color: editor.getAttributes("highlight").color
                  ? "#000"
                  : "currentColor",
              }}
            >
              H
            </span>
          </button>

          {isHighlightPickerOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              <div className="grid w-24 grid-cols-3 gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleHighlightChange(color.value)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 transition-transform hover:scale-110"
                    style={{ backgroundColor: color.value || "transparent" }}
                    title={color.name}
                  >
                    {!color.value && <span className="text-xs">×</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          onClick={() => setIsLinkEditorOpen(true)}
          className={clsx(
            "rounded p-2 transition-colors hover:bg-gray-100",
            editor.isActive("link")
              ? "bg-gray-100 text-blue-600"
              : "text-gray-700",
          )}
          title="Add Link (⌘K)"
        >
          <span className="text-sm">🔗</span>
        </button>

        <button
          onClick={() => {
            // This would integrate with a commenting system
            logInfo("Add comment functionality here");
          }}
          className="rounded p-2 text-gray-700 transition-colors hover:bg-gray-100"
          title="Add Comment"
        >
          <span className="text-sm">💬</span>
        </button>
      </div>

      <LinkEditor
        editor={editor}
        isOpen={isLinkEditorOpen}
        onClose={() => setIsLinkEditorOpen(false)}
        initialUrl={
          editor.isActive("link") ? editor.getAttributes("link").href || "" : ""
        }
      />
    </BubbleMenu>
  );
}

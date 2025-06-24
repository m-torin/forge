import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";

interface RootLayoutUIProps {
  children: React.ReactNode;
}

/**
 * Root layout UI component that renders the HTML structure
 *
 * This component only handles the HTML/body structure as a server component.
 * Providers and app layout are handled by child layouts to allow
 * for locale-specific configurations.
 */
export function RootLayoutUI({
  children,
}: RootLayoutUIProps): React.JSX.Element {
  return (
    <html {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

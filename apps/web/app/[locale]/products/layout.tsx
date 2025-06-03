import { Container } from "@mantine/core";

import type { ReactNode } from "react";

interface ProductsLayoutProps {
  children: ReactNode;
  filters: ReactNode;
  modal: ReactNode;
  results: ReactNode;
}

export default function ProductsLayout({
  children,
  filters,
  modal,
  results,
}: ProductsLayoutProps) {
  return (
    <>
      <Container py="md" size="xl">
        <div
          style={{
            gridTemplateColumns: "250px 1fr",
            display: "grid",
            gap: "2rem",
          }}
        >
          <aside>{filters}</aside>
          <main>
            {results}
            {children}
          </main>
        </div>
      </Container>
      {modal}
    </>
  );
}

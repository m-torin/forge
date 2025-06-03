import type { ReactNode } from "react";

interface GalleryLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function GalleryLayout({ children, modal }: GalleryLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

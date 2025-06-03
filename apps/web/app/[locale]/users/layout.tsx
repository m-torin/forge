import type { ReactNode } from "react";

interface UsersLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function UsersLayout({ children, modal }: UsersLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

import React, { type ReactNode } from 'react';

interface LegalLayoutProps {
  children: ReactNode;
}

const LegalLayout = ({ children }: LegalLayoutProps) => <>{children}</>;

export default LegalLayout;

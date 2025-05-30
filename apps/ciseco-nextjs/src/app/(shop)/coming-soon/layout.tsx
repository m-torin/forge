import Header from '@/components/Header/Header';
import { type FC } from 'react';

import { ApplicationLayout } from '../application-layout';

interface Props {
  children?: React.ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <ApplicationLayout footer={<div />} header={<Header hasBorderBottom />}>
      {children}
    </ApplicationLayout>
  );
};

export default Layout;

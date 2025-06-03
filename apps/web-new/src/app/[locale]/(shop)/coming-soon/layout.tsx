import { type FC } from "react";

import { Header } from "@repo/design-system/ciseco";

import { ApplicationLayout } from "../application-layout";

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

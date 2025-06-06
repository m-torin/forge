import React, { type FC } from "react";

import { Divider, Footer, Header2 } from "@repo/design-system/mantine-ciseco";

import PageTab from "./PageTab";

interface Props {
  children?: React.ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Header2 />
      <div className="container">
        <div className="mt-14 sm:mt-20">
          <div className="mx-auto max-w-4xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold xl:text-4xl">Account</h2>
              <span className="mt-4 block text-base text-neutral-500 sm:text-lg dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  Enrico Cole,
                </span>{" "}
                ciseco@gmail.com · Los Angeles, CA
              </span>
            </div>

            <Divider className="mt-10" />
            <PageTab />
            <Divider />
          </div>
        </div>
        <div className="mx-auto max-w-4xl pb-24 pt-14 sm:pt-20 lg:pb-32">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;

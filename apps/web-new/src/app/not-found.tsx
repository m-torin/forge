import { type Metadata } from "next";

import { ButtonPrimary, NcImage } from "@repo/design-system/mantine-ciseco";
import I404Png from "@repo/design-system/mantine-ciseco/images/404.png";

export const metadata: Metadata = {
  description: "The page you were looking for doesn't exist.",
  title: "Page Not Found",
};

const Page404 = () => (
  <div className="nc-Page404">
    <div className="container relative pb-16 pt-5 lg:pb-20 lg:pt-5">
      {/* HEADER */}
      <header className="mx-auto max-w-2xl space-y-2 text-center">
        <NcImage alt="not-found" src={I404Png} />
        <span className="block text-sm font-medium tracking-wider text-neutral-800 sm:text-base dark:text-neutral-200">
          {`THE PAGE YOU WERE LOOKING FOR DOESN'T EXIST.`}{" "}
        </span>
        <div className="pt-8">
          <ButtonPrimary href="/">Return Home Page</ButtonPrimary>
        </div>
      </header>
    </div>
  </div>
);

export default Page404;

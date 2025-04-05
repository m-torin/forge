import merge from "lodash.merge";

import type { Metadata } from "next";

type MetadataGenerator = Omit<Metadata, "description" | "title"> & {
  title: string;
  description: string;
  image?: string;
};

const applicationName = "next-forge";
const author: Metadata["authors"] = {
  name: "Hayden Bleasel",
  url: "https://haydenbleasel.com/",
};
const publisher = "Hayden Bleasel";
const twitterHandle = "@haydenbleasel";

export const createMetadata = ({
  description,
  image,
  title,
  ...properties
}: MetadataGenerator): Metadata => {
  const parsedTitle = `${title} | ${applicationName}`;
  const defaultMetadata: Metadata = {
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    applicationName,
    authors: [author],
    creator: author.name,
    description,
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: "website",
      description,
      locale: "en_US",
      siteName: applicationName,
      title: parsedTitle,
    },
    publisher,
    title: parsedTitle,
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        width: 1200,
        url: image,
        alt: title,
        height: 630,
      },
    ];
  }

  return metadata;
};

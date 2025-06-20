import merge from 'lodash.merge';
import { Metadata } from 'next';

type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
  description: string;
  image?: string;
  title: string;
};

const applicationName = 'forge';
const author: Metadata['authors'] = {
  name: 'Hayden Bleasel',
  url: 'https://haydenbleasel.com/',
};
const publisher = 'Hayden Bleasel';
const twitterHandle = '@haydenbleasel';

export const createMetadata = ({
  description,
  image,
  title,
  ...properties
}: MetadataGenerator): Metadata => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const parsedTitle = `${title} | ${applicationName}`;
  const defaultMetadata: Metadata = {
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: parsedTitle,
    },
    applicationName,
    authors: [author],
    creator: author.name,
    description,
    formatDetection: {
      telephone: false,
    },
    metadataBase: productionUrl ? new URL(`${protocol}://${productionUrl}`) : undefined,
    openGraph: {
      description,
      locale: 'en_US',
      siteName: applicationName,
      title: parsedTitle,
      type: 'website',
    },
    publisher,
    title: parsedTitle,
    twitter: {
      card: 'summary_large_image',
      creator: twitterHandle,
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        alt: title,
        height: 630,
        url: image,
        width: 1200,
      },
    ];
  }

  return metadata;
};

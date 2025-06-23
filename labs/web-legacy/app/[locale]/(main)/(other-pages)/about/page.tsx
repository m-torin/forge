import { type Metadata } from 'next';
import { createMetadata, structuredData } from '@repo/seo/server/next';
import { OptimizedJsonLd } from '@repo/seo/client/next';

import { BgGlassmorphism, Divider, SectionClientSay, SectionPromo1 } from '@/components/ui';

import SectionFounder from './SectionFounder';
import SectionHero from './SectionHero';
import SectionStatistic from './SectionStatistic';
// Hero image import removed - using placeholder
const rightImg = 'https://via.placeholder.com/600x400';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const aboutUrl = `${baseUrl}/${locale}/about`;

  return createMetadata({
    title: 'About Us',
    description:
      "We're impartial and independent, and every day we create distinctive, world-class programmes and content which inform, educate and entertain millions of people in the around the world.",
    alternates: {
      canonical: aboutUrl,
      languages: {
        en: `${baseUrl}/en/about`,
        es: `${baseUrl}/es/about`,
        fr: `${baseUrl}/fr/about`,
        de: `${baseUrl}/de/about`,
        pt: `${baseUrl}/pt/about`,
      },
    },
  });
}

const PageAbout = () => {
  const organizationData = structuredData.organization({
    name: 'Web Template Company',
    description:
      "We're impartial and independent, and every day we create distinctive, world-class programmes and content which inform, educate and entertain millions of people in the around the world.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/logo.png`,
    sameAs: [
      'https://twitter.com/yourcompany',
      'https://facebook.com/yourcompany',
      'https://linkedin.com/company/yourcompany',
      'https://instagram.com/yourcompany',
    ],
    contactPoint: {
      telephone: '+1-555-123-4567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Spanish', 'French', 'German', 'Portuguese'],
    },
  });

  return (
    <div>
      <OptimizedJsonLd data={organizationData} id="organization" strategy="afterInteractive" />
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />
      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:py-28 lg:pt-20">
        <SectionHero
          heading="👋 About Us."
          rightImg={rightImg}
          subHeading="We're impartial and independent, and every day we create distinctive, world-class programmes and content which inform, educate and entertain millions of people in the around the world."
        />
        <SectionFounder />
        <Divider />
        <SectionStatistic />
        <Divider />
        <SectionClientSay />

        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  );
};

export default PageAbout;

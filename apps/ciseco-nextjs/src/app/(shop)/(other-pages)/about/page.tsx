import rightImg from '@/images/hero-right1.png';
import { type Metadata } from 'next';

import { BgGlassmorphism } from '@repo/design-system/ciesco2';
import { Divider } from '@repo/design-system/ciesco2';
import { SectionClientSay } from '@repo/design-system/ciesco2';
import { SectionPromo1 } from '@repo/design-system/ciesco2';

import SectionFounder from './SectionFounder';
import SectionHero from './SectionHero';
import SectionStatistic from './SectionStatistic';

export const metadata: Metadata = {
  description:
    'About Us. We’re impartial and independent, and every day we create distinctive, world-class programmes and content which inform, educate and entertain millions of people in the around the world.',
  title: 'About Us',
};

const PageAbout = () => {
  return (
    <div>
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />
      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:py-28 lg:pt-20">
        <SectionHero
          heading="👋 About Us."
          rightImg={rightImg}
          subHeading="We’re impartial and independent, and every day we create distinctive, world-class programmes and content which inform, educate and entertain millions of people in the around the world."
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

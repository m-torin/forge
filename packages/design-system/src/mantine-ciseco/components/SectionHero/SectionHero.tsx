'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { type FC, type ReactNode, useEffect, useRef } from 'react';

import { useLocalizeHref } from '../../hooks/useLocale';
import rightImg from '../../images/hero-right-1.png';
import ButtonPrimary from '../shared/Button/ButtonPrimary';
import ButtonSecondary from '../shared/Button/ButtonSecondary';

export interface SectionHeroProps extends Record<string, any> {
  animated?: boolean;
  backgroundImage?: string;
  className?: string;
  ctaButtons?: {
    href?: string;
    onClick?: () => void;
    text: string;
    variant?: 'primary' | 'secondary';
  }[];
  fullHeight?: boolean;
  heading?: ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  showScrollIndicator?: boolean;
  subheading?: string;
  textAlign?: 'center' | 'left' | 'right';
  videoBackground?: string;
  videoProps?: {
    autoPlay?: boolean;
    muted?: boolean;
  };
}

const SectionHero: FC<SectionHeroProps> = ({
  animated = false,
  backgroundImage,
  className = '',
  ctaButtons,
  fullHeight = false,
  heading = 'Discover, collect, and sell extraordinary NFTs ',
  overlay = false,
  overlayOpacity = 0.5,
  showScrollIndicator = false,
  subheading = 'Discover the most outstanding NTFs in all topics of life. Creative your NTFs and sell them',
  textAlign = 'left',
  videoBackground,
  videoProps,
}) => {
  const localizeHref = useLocalizeHref();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoProps) {
      if (videoProps.muted) {
        videoRef.current.setAttribute('muted', '');
      }
      if (videoProps.autoPlay) {
        videoRef.current.setAttribute('autoplay', '');
      }
    }
  }, [videoProps]);

  const getTextAlignClass = () => {
    switch (textAlign) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getAnimationClass = () => {
    return animated ? 'animate-fade-in-up' : '';
  };

  return (
    <div
      className={`relative ${fullHeight ? 'min-h-screen' : ''} ${className}`}
      data-testid="hero-section"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          data-testid="hero-overlay"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Video Background */}
      {videoBackground && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          ref={videoRef}
          role="presentation"
          src={videoBackground}
        />
      )}

      <div className="relative flex flex-col space-y-14 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-10">
        <div
          className={`w-screen max-w-full space-y-5 lg:space-y-7 xl:max-w-xl ${getTextAlignClass()}`}
          data-testid="hero-content"
        >
          <h1
            className={`text-3xl leading-tight! font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100 ${getAnimationClass()}`}
          >
            {heading}
          </h1>
          <span
            className={`block max-w-lg text-base text-neutral-600 xl:text-lg dark:text-neutral-400 ${getAnimationClass()}`}
          >
            {subheading}
          </span>

          {/* CTA Buttons */}
          {ctaButtons && ctaButtons.length > 0 ? (
            <div className="flex space-x-4 pt-7">
              {ctaButtons.map((button: any) => {
                if (button.href) {
                  return button.variant === 'secondary' ? (
                    <ButtonSecondary key={button.text} href={button.href}>
                      {button.text}
                    </ButtonSecondary>
                  ) : (
                    <ButtonPrimary key={button.text} href={button.href}>
                      {button.text}
                    </ButtonPrimary>
                  );
                } else {
                  return button.variant === 'secondary' ? (
                    <ButtonSecondary key={button.text} onClick={button.onClick}>
                      {button.text}
                    </ButtonSecondary>
                  ) : (
                    <ButtonPrimary key={button.text} onClick={button.onClick}>
                      {button.text}
                    </ButtonPrimary>
                  );
                }
              })}
            </div>
          ) : (
            <div className="flex space-x-4 pt-7">
              <ButtonPrimary href={localizeHref('/search')}>
                <span>Explore</span>
                <MagnifyingGlassIcon className="ml-2.5 h-5 w-5" />
              </ButtonPrimary>
              <ButtonSecondary href={localizeHref('/search')}>
                <span>Create</span>
                <svg className="ml-2.5 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M13.26 3.59997L5.04997 12.29C4.73997 12.62 4.43997 13.27 4.37997 13.72L4.00997 16.96C3.87997 18.13 4.71997 18.93 5.87997 18.73L9.09997 18.18C9.54997 18.1 10.18 17.77 10.49 17.43L18.7 8.73997C20.12 7.23997 20.76 5.52997 18.55 3.43997C16.35 1.36997 14.68 2.09997 13.26 3.59997Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M11.89 5.05005C12.32 7.81005 14.56 9.92005 17.34 10.2"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3 22H21"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="1.5"
                  />
                </svg>
              </ButtonSecondary>
            </div>
          )}
        </div>

        <div className="grow">
          <Image
            alt="Hero image"
            className="w-full"
            height={600}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            src={rightImg}
            width={800}
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <button
          aria-label="Scroll to next section"
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          data-testid="scroll-indicator"
          type="button"
          onClick={() => {
            window.scrollTo({ behavior: 'smooth', top: window.innerHeight });
          }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </button>
      )}
    </div>
  );
};

export { SectionHero };
export default SectionHero;

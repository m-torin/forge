'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { type FC, type ReactNode, useEffect, useRef } from 'react';

import { useLocalizeHref } from '../../hooks/useLocale';
import rightImg from '../../images/hero-right-1.png';
import ButtonPrimary from '../shared/Button/ButtonPrimary';
import ButtonSecondary from '../shared/Button/ButtonSecondary';

export interface SectionHeroProps {
  animated?: boolean;
  backgroundImage?: string;
  className?: string;
  ctaButtons?: {
    text: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  }[];
  fullHeight?: boolean;
  heading?: ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  showScrollIndicator?: boolean;
  subheading?: string;
  textAlign?: 'left' | 'center' | 'right';
  videoBackground?: string;
  videoProps?: {
    muted?: boolean;
    autoPlay?: boolean;
  };
}

const SectionHero: FC<SectionHeroProps> = ({
  videoBackground,
  videoProps,
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
      data-testid="hero-section"
      className={`relative ${fullHeight ? 'min-h-screen' : ''} ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* Overlay */}
      {overlay && (
        <div
          data-testid="hero-overlay"
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Video Background */}
      {videoBackground && (
        <video
          ref={videoRef}
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover"
          src={videoBackground}
        />
      )}

      <div className="relative flex flex-col space-y-14 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-10">
        <div
          data-testid="hero-content"
          className={`w-screen max-w-full space-y-5 lg:space-y-7 xl:max-w-xl ${getTextAlignClass()}`}
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
              {ctaButtons.map((button, index) => {
                if (button.href) {
                  return button.variant === 'secondary' ? (
                    <ButtonSecondary key={index} href={button.href}>
                      {button.text}
                    </ButtonSecondary>
                  ) : (
                    <ButtonPrimary key={index} href={button.href}>
                      {button.text}
                    </ButtonPrimary>
                  );
                } else {
                  return button.variant === 'secondary' ? (
                    <ButtonSecondary key={index} onClick={button.onClick}>
                      {button.text}
                    </ButtonSecondary>
                  ) : (
                    <ButtonPrimary key={index} onClick={button.onClick}>
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
                <svg viewBox="0 0 24 24" className="ml-2.5 h-5 w-5" fill="none">
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    d="M13.26 3.59997L5.04997 12.29C4.73997 12.62 4.43997 13.27 4.37997 13.72L4.00997 16.96C3.87997 18.13 4.71997 18.93 5.87997 18.73L9.09997 18.18C9.54997 18.1 10.18 17.77 10.49 17.43L18.7 8.73997C20.12 7.23997 20.76 5.52997 18.55 3.43997C16.35 1.36997 14.68 2.09997 13.26 3.59997Z"
                  />
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    d="M11.89 5.05005C12.32 7.81005 14.56 9.92005 17.34 10.2"
                  />
                  <path
                    strokeWidth="1.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    d="M3 22H21"
                  />
                </svg>
              </ButtonSecondary>
            </div>
          )}
        </div>

        <div className="grow">
          <Image
            width={800}
            priority
            className="w-full"
            alt="Hero image"
            height={600}
            sizes="(max-width: 768px) 100vw, 50vw"
            src={rightImg}
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div
          data-testid="scroll-indicator"
          onClick={() => {
            window.scrollTo({ behavior: 'smooth', top: window.innerHeight });
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
};

export { SectionHero };
export default SectionHero;

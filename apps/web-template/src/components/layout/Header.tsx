'use client';

import { Box, Burger, Container, Group } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { type FC, memo, useCallback } from 'react';

import { ColorSchemesSwitcher } from '@/components/ColorSchemesSwitcher';
import CartButton from '@/components/layout/CartButton';
import GuestNavMenu from '@/components/layout/GuestNavMenu';
import Logo from '@/components/layout/Logo';
import Navigation from '@/components/layout/Navigation';
import TabNavigation from '@/components/layout/TabNavigation';
import ProductionFederatedAutocomplete from '@/components/search/ProductionFederatedAutocomplete';

import { TCollection, TNavigationItem } from '@/types';

export interface HeaderProps {
  cartItemsCount?: number;
  dict?: {
    navigation?: {
      account?: string;
      help?: string;
      home?: string;
      login?: string;
      logout?: string;
      orders?: string;
      search?: string;
      wishlist?: string;
    };
    search?: {
      button?: string;
      placeholder?: string;
    };
  };
  featuredCollection?: TCollection;
  hasBorder?: boolean;
  locale?: string;
  mobileMenuOpen?: boolean;
  navbarOpen?: boolean;
  navigationMenu?: TNavigationItem[];
  onMobileMenuToggle?: () => void;
  onNavbarToggle?: () => void;
  user?: null | {
    avatar?: string;
    email?: string;
    name?: string;
  };
}

const Header: FC<HeaderProps> = memo(
  ({
    cartItemsCount = 0,
    dict,
    featuredCollection,
    hasBorder = true,
    locale = 'en',
    mobileMenuOpen = false,
    navbarOpen = true,
    navigationMenu = [],
    onMobileMenuToggle,
    onNavbarToggle,
    user: _user,
  }) => {
    // Mock user for demo purposes - static object
    const mockUser = {
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format',
      email: 'john.doe@example.com',
      name: 'John Doe',
    };

    const router = useRouter();
    const { width: viewportWidth } = useViewportSize();
    const isMobile = viewportWidth <= 768;

    // Use mobile state on mobile, desktop state on desktop
    // For Burger: opened=true shows X, opened=false shows hamburger ☰
    const isMenuOpen = isMobile ? mobileMenuOpen : navbarOpen;

    // Memoize burger click handler to prevent recreation
    const handleBurgerClick = useCallback(() => {
      if (isMobile && onMobileMenuToggle) {
        onMobileMenuToggle();
      } else if (!isMobile && onNavbarToggle) {
        onNavbarToggle();
      }
    }, [isMobile, onMobileMenuToggle, onNavbarToggle]);

    // Handle federated search selection
    const handleSearchSelect = useCallback(
      (item: any, source: string) => {
        // Navigate based on source type
        if (source === 'products' && item.objectID) {
          router.push(`/${locale}/products/${item.objectID}`);
        } else if (source === 'articles' && item.objectID) {
          router.push(`/${locale}/blog/${item.objectID}`);
        } else if (source === 'faq' && item.objectID) {
          router.push(`/${locale}/help?faq=${item.objectID}`);
        } else if (source === 'querysuggestions' && item.query) {
          router.push(`/${locale}/search?q=${encodeURIComponent(item.query)}`);
        } else {
          router.push(
            `/${locale}/search?q=${encodeURIComponent(item.query || item.name || item.title)}`,
          );
        }
      },
      [router, locale],
    );

    return (
      <Box className="relative z-50 w-full h-auto bg-transparent flex flex-col">
        {/* Main Header Bar */}
        <Box
          className={clsx(
            'relative border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-transparent',
            !hasBorder && 'has-[.header-popover-full-panel]:border-b',
          )}
        >
          <Container className="min-h-20 py-4" fluid>
            <Group h="100%" justify="space-between" px="md">
              {/* Left Section - Hamburger and Logo */}
              <Group gap="md">
                <Burger
                  className="text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  opened={isMenuOpen}
                  size="md"
                  onClick={handleBurgerClick}
                />
                <Logo locale={locale} />
              </Group>

              {/* Center - Desktop Navigation and Search */}
              <Group className="hidden lg:flex" gap="xl">
                <Navigation
                  featuredCollection={featuredCollection}
                  locale={locale}
                  menu={navigationMenu}
                />
                <ProductionFederatedAutocomplete
                  className="w-64"
                  placeholder={
                    dict?.search?.placeholder || 'Search products, articles, help...'
                  }
                  size="lg"
                  locale={locale}
                  onSelect={handleSearchSelect}
                />
              </Group>

              {/* Right Actions */}
              <Group gap="md">
                <ColorSchemesSwitcher />
                <GuestNavMenu dict={dict?.navigation} locale={locale} user={mockUser} />
                <CartButton locale={locale} numberItems={cartItemsCount} />
              </Group>
            </Group>
          </Container>
        </Box>

        {/* Tab Navigation */}
        <Box
          className={clsx(
            'w-full py-2',
            hasBorder && 'border-t border-gray-200 dark:border-neutral-700',
          )}
        >
          <TabNavigation locale={locale} />
        </Box>
      </Box>
    );
  },
);

Header.displayName = 'Header';

export default Header;

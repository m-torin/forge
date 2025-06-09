'use client';

import { type FC } from 'react';

import { type getCurrencies, type getLanguages } from '../../data/types';
import { useLocale } from '../../hooks/useLocale';

import CurrLangDropdown from './CurrLangDropdown';

interface Props {
  className?: string;
  currencies: Awaited<ReturnType<typeof getCurrencies>>;
  languages: Awaited<ReturnType<typeof getLanguages>>;
  panelClassName?: string;
  panelPosition?: 'bottom-end' | 'bottom-start';
}

/**
 * Client-side wrapper for CurrLangDropdown that automatically detects the current locale
 */
const CurrLangDropdownClient: FC<Props> = (props) => {
  const currentLocale = useLocale();

  return <CurrLangDropdown {...props} currentLocale={currentLocale} />;
};

export default CurrLangDropdownClient;

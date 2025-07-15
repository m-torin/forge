'use client';

import { useGlobalKeyboardShortcuts, useMessageNavigation } from '#/components/keyboard-navigation';

export function KeyboardNavigationInitializer() {
  useGlobalKeyboardShortcuts();
  useMessageNavigation();

  return null;
}

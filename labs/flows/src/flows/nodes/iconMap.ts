// iconMap.ts
import {
  IconBrandAws,
  IconBrandGoogle,
  IconBrandAzure,
  IconSquare,
  IconDatabase,
  IconServer,
  IconCloud,
  IconClock,
  IconApi,
  IconBrandGithub,
  IconAsterisk,
  IconBrandOpenai,
  IconBrandJavascript,
  IconBrandPython,
  IconWebhook,
  IconArrowFork,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

export type IconName =
  | 'IconBrandAws'
  | 'IconBrandGoogle'
  | 'IconBrandAzure'
  | 'IconSquare'
  | 'IconDatabase'
  | 'IconAsterisk'
  | 'IconBrandGithub'
  | 'IconBrandOpenai'
  | 'IconArrowFork'
  | 'IconBrandJavascript'
  | 'IconBrandPython'
  | 'IconClock'
  | 'IconServer'
  | 'IconCloud'
  | 'IconWebhook'
  | 'IconApi'
  | 'IconDefault';

export const iconMap: Record<IconName, Icon> = {
  IconBrandAws,
  IconBrandGoogle,
  IconBrandAzure,
  IconSquare,
  IconBrandOpenai,
  IconDatabase,
  IconWebhook,
  IconBrandGithub,
  IconAsterisk,
  IconArrowFork,
  IconBrandJavascript,
  IconBrandPython,
  IconServer,
  IconCloud,
  IconClock,
  IconApi,
  IconDefault: IconSquare,
};

/**
 * Get icon component from icon name
 */
export function getIconByName(name: IconName): Icon {
  return iconMap[name] || iconMap.IconDefault;
}

/**
 * Get icon name from icon component
 */
export function getIconName(icon: Icon): IconName {
  const entry = Object.entries(iconMap).find(([_, value]) => value === icon);
  return (entry?.[0] as IconName) || 'IconDefault';
}

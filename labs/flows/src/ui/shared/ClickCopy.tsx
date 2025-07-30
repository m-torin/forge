import {
  ActionIcon,
  Button,
  rem,
  Tooltip,
  Text,
  ButtonProps,
  ActionIconProps,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { ComponentPropsWithoutRef } from 'react';

type BaseButtonCopyProps = {
  type?: 'button' | 'icon' | 'textLink';
  copyThis: string;
} & ButtonProps;

type ExtendedButtonCopyProps = BaseButtonCopyProps & {
  actionIconProps?: Omit<ActionIconProps, keyof BaseButtonCopyProps>;
  textProps?: Omit<ComponentPropsWithoutRef<'p'>, keyof BaseButtonCopyProps>;
};

export const ButtonCopy = ({
  type = 'button',
  copyThis,
  actionIconProps,
  textProps,
  size = 'md', // provide default size
  ...buttonProps
}: ExtendedButtonCopyProps) => {
  const clipboard = useClipboard();
  const iconSize = { width: rem(16), height: rem(16) }; // Smaller default icon size
  const iconStyle = (Icon: any) => <Icon style={iconSize} stroke={1.5} />;

  // Adjust button styles based on size
  const getButtonStyles = (size: string) => {
    const sizeMap = {
      xs: { paddingRight: rem(8), section: rem(12) },
      sm: { paddingRight: rem(10), section: rem(16) },
      md: { paddingRight: rem(14), section: rem(20) },
      lg: { paddingRight: rem(16), section: rem(24) },
      xl: { paddingRight: rem(20), section: rem(28) },
    };

    const sizeValues = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

    return {
      root: { paddingRight: sizeValues.paddingRight },
      section: { marginLeft: sizeValues.section },
    };
  };

  const getContent = () => {
    switch (type) {
      case 'icon':
        return (
          <ActionIcon
            variant="outline"
            size="lg"
            onClick={() => clipboard.copy(copyThis)}
            {...actionIconProps}
          >
            {clipboard.copied ? iconStyle(IconCheck) : iconStyle(IconCopy)}
          </ActionIcon>
        );
      case 'textLink':
        return (
          <Text
            c="blue.7"
            onClick={() => clipboard.copy(copyThis)}
            style={{ cursor: 'pointer' }}
            {...textProps}
          >
            Copy to clipboard
          </Text>
        );
      case 'button':
      default:
        return (
          <Button
            variant="light"
            rightSection={
              clipboard.copied ? iconStyle(IconCheck) : iconStyle(IconCopy)
            }
            radius="xl"
            size={size}
            styles={getButtonStyles(size)}
            onClick={() => clipboard.copy(copyThis)}
            {...buttonProps}
          >
            {buttonProps.children || 'Copy to clipboard'}
          </Button>
        );
    }
  };

  return (
    <Tooltip
      label="Link copied!"
      offset={5}
      position="bottom"
      radius="xl"
      transitionProps={{ duration: 100, transition: 'slide-down' }}
      opened={clipboard.copied}
    >
      {getContent()}
    </Tooltip>
  );
};

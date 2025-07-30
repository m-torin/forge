import { Box, ButtonProps, Stack, Button } from '@mantine/core';
import styles from './IconButton.module.scss';

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  ...props
}) => {
  return (
    <Button classNames={{ root: styles.iconButton }} {...props}>
      <Stack align="stretch" justify="center" gap="0">
        {children}
        <Box>{icon}</Box>
      </Stack>
    </Button>
  );
};

'use client';

import styles from './Avatar.module.scss';
import {
  Box,
  Group,
  Avatar as MantineAvatar,
  AvatarProps as MantineAvatarProps,
} from '@mantine/core';

interface AvatarProps extends MantineAvatarProps {
  imgUri: string;
  altTag: string;
  children?: React.ReactNode;
}

const AvatarContent: React.FC<{
  imgUri: string;
  altTag: string;
  rest: Omit<MantineAvatarProps, 'src' | 'alt' | 'component'>;
}> = ({ imgUri, altTag, rest }) => (
  <Box className={styles.circle}>
    <MantineAvatar
      src={imgUri}
      alt={altTag}
      className={styles.image}
      {...rest}
    />
  </Box>
);

export const Avatar: React.FC<AvatarProps> = ({
  imgUri,
  altTag,
  children,
  ...rest
}) => {
  if (children) {
    return (
      <Group className={styles.group}>
        <AvatarContent imgUri={imgUri} altTag={altTag} rest={rest} />
        {children}
      </Group>
    );
  }
  
  return <AvatarContent imgUri={imgUri} altTag={altTag} rest={rest} />;
};

export default Avatar;

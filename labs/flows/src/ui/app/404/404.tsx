'use client';

import { useDocumentTitle } from '@mantine/hooks';
import { Center, rem, Text } from '@mantine/core';

export const FourOhFour = () => {
  useDocumentTitle('404 Error - Page Not Found');

  return (
    <Center w="100vw" h="100vh" bg="gray.8" style={{ flexDirection: 'column' }}>
      <Text
        style={{ fontSize: rem(130) }}
        fw={900}
        inherit
        variant="gradient"
        gradient={{ from: 'pink', to: 'yellow' }}
      >
        404
      </Text>
    </Center>
  );
};

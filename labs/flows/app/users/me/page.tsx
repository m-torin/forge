// app/[domain]/(users)/me/page.tsx
import { Container, rem } from '@mantine/core';
import { Suspense } from 'react';

function FlowsContent({ children }: { children: React.ReactNode }) {
  return (
    <Container size="lg" mt={rem(20)} mb={rem(20)}>
      {children}
    </Container>
  );
}

// Page Component (Server Component by default in App Router)
export default async function ProfilePage() {
  // You can perform any async operations here
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlowsContent>
        <h1>Hello, My Profile!</h1>
      </FlowsContent>
    </Suspense>
  );
}

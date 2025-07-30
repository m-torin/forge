import { cookies } from 'next/headers';
import Link from 'next/link';

import { auth } from '#/app/(auth)/auth';
import { Chat } from '#/components/chat';
import { DataStreamHandler } from '#/components/data-stream-handler';
import { FeatureOnboarding } from '#/components/features/feature-onboarding';
import { FeatureProgressTracker } from '#/components/features/feature-progress-tracker';
import { FeatureShowcase } from '#/components/features/feature-showcase';
import { QuickAccessMenu } from '#/components/quick-access-menu';
import { Button } from '#/components/ui/button';
import { DEFAULT_CHAT_MODEL } from '#/lib/ai/models';
import { RESPONSIVE } from '#/lib/ui-constants';
import { generateUUID } from '#/lib/utils';
import { redirect } from 'next/navigation';

/**
 * Main chat page component with feature showcase option
 * @param searchParams - URL search parameters including showcase flag
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ showcase?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const id = generateUUID();
  const resolvedSearchParams = await searchParams;
  const showShowcase = resolvedSearchParams.showcase === 'true';

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const modelId = modelIdFromCookie?.value || DEFAULT_CHAT_MODEL;

  if (showShowcase) {
    return (
      <div className="flex h-full flex-col">
        <div
          className={`flex items-center justify-between border-b ${RESPONSIVE.LAYOUT.CONTENT_MOBILE}`}
        >
          <h1 className={`${RESPONSIVE.TYPOGRAPHY.HEADING.LG} font-semibold`}>
            AI Chatbot Features
          </h1>
          <Link href="/">
            <Button variant="outline" size="sm" className={RESPONSIVE.TOUCH_TARGET.SMALL}>
              Start Chatting
            </Button>
          </Link>
        </div>
        <div className={`flex-1 overflow-y-auto ${RESPONSIVE.LAYOUT.CONTENT_MOBILE}`}>
          <FeatureShowcase />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Feature Onboarding - shows only on first visit */}
      <FeatureOnboarding />

      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelId}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler />

      {/* Coordinated fixed elements */}
      <QuickAccessMenu />
      <FeatureProgressTracker />
    </>
  );
}

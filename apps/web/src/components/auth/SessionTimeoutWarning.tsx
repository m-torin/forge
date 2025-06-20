'use client';

import { useEffect, useState, useCallback } from 'react';
import { Modal, Button, Text, Group, Progress } from '@mantine/core';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IconClock, IconLogout } from '@tabler/icons-react';
import { useAuth, authClient } from '@repo/auth/client/next';
import { useRouter } from 'next/navigation';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD = 5 * 60 * 1000; // Show warning 5 minutes before timeout
const COUNTDOWN_INTERVAL = 1000; // Update every second

function SessionTimeoutWarningInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_THRESHOLD);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Reset activity timer on user interaction
  const resetActivityTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      // Refresh the session through Better Auth
      // Session is automatically refreshed on API calls
      // Make a simple auth check to refresh the session
      await authClient.getSession();
      resetActivityTimer();
    } catch (_error) {
      console.error('Failed to extend session:', _error);
    }
  }, [resetActivityTimer]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await authClient.signOut();
      router.push('/login');
    } catch (_error) {
      console.error('Failed to logout:', _error);
    }
  }, [router]);

  // Monitor user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // Only reset if it's been more than 1 minute since last activity
      if (timeSinceLastActivity > 60000) {
        resetActivityTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, lastActivity, resetActivityTimer]);

  // Check for timeout
  useEffect(() => {
    if (!user) return;

    const checkTimeout = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        // Session expired
        handleLogout();
      } else if (timeSinceLastActivity >= SESSION_TIMEOUT - WARNING_THRESHOLD) {
        // Show warning
        const remaining = SESSION_TIMEOUT - timeSinceLastActivity;
        setTimeRemaining(remaining);
        setShowWarning(true);
      }
    }, COUNTDOWN_INTERVAL);

    return () => clearInterval(checkTimeout);
  }, [user, lastActivity, handleLogout]);

  // Update countdown
  useEffect(() => {
    if (!showWarning) return;

    const countdown = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - COUNTDOWN_INTERVAL;
        if (newTime <= 0) {
          handleLogout();
          return 0;
        }
        return newTime;
      });
    }, COUNTDOWN_INTERVAL);

    return () => clearInterval(countdown);
  }, [showWarning, handleLogout]);

  if (!user || !showWarning) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const progress = (timeRemaining / WARNING_THRESHOLD) * 100;

  return (
    <Modal
      opened={showWarning}
      onClose={() => setShowWarning(false)}
      title={
        <Group gap="xs">
          <IconClock size={20} />
          <Text fw={500}>Session Expiring Soon</Text>
        </Group>
      }
      centered
      size="sm"
    >
      <Text mb="md">
        Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')} due to
        inactivity.
      </Text>

      <Progress value={progress} color="orange" mb="lg" animated />

      <Text size="sm" color="dimmed" mb="lg">
        Would you like to stay logged in?
      </Text>

      <Group grow>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
        >
          Log out
        </Button>
        <Button leftSection={<IconClock size={16} />} onClick={extendSession}>
          Stay logged in
        </Button>
      </Group>
    </Modal>
  );
}

export function SessionTimeoutWarning() {
  return (
    <ErrorBoundary fallback={null}>
      <SessionTimeoutWarningInner />
    </ErrorBoundary>
  );
}

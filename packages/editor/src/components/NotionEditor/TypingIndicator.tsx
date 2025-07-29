'use client';

import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import type { Collaborator } from '../../types/collaboration';

export interface TypingIndicatorProps {
  collaborators: Collaborator[];
  currentUserId: string;
  className?: string;
  showAvatars?: boolean;
  maxVisibleUsers?: number;
}

export function TypingIndicator({
  collaborators,
  currentUserId,
  className,
  showAvatars = true,
  maxVisibleUsers = 3,
}: TypingIndicatorProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  // Filter out current user and get only typing users
  const typingUsers = useMemo(() => {
    return collaborators.filter(
      collaborator =>
        collaborator.id !== currentUserId && collaborator.isTyping && collaborator.isActive,
    );
  }, [collaborators, currentUserId]);

  // Animate dots
  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (typingUsers.length === 0) {
    return null;
  }

  const visibleUsers = typingUsers.slice(0, maxVisibleUsers);
  const hiddenCount = Math.max(0, typingUsers.length - maxVisibleUsers);

  const renderTypingDots = () => (
    <div className="ml-2 flex items-center gap-0.5">
      {[0, 1, 2].map(dotIndex => (
        <div
          key={dotIndex}
          className={clsx(
            'h-1 w-1 rounded-full bg-gray-400 transition-opacity duration-200',
            animationPhase > dotIndex ? 'opacity-100' : 'opacity-30',
          )}
          style={{
            animationDelay: `${dotIndex * 150}ms`,
          }}
        />
      ))}
    </div>
  );

  const renderUserList = () => {
    if (typingUsers.length === 1) {
      return `${visibleUsers[0].name} is typing`;
    } else if (typingUsers.length === 2) {
      return `${visibleUsers[0].name} and ${visibleUsers[1].name} are typing`;
    } else if (typingUsers.length <= maxVisibleUsers) {
      const names = visibleUsers
        .slice(0, -1)
        .map(u => u.name)
        .join(', ');
      return `${names}, and ${visibleUsers[visibleUsers.length - 1].name} are typing`;
    } else {
      const names = visibleUsers.map(u => u.name).join(', ');
      return `${names} and ${hiddenCount} other${hiddenCount > 1 ? 's' : ''} are typing`;
    }
  };

  return (
    <div
      className={clsx(
        'typing-indicator flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600',
        'animate-in slide-in-from-bottom-2 fade-in-0 duration-200',
        className,
      )}
    >
      {/* User Avatars */}
      {showAvatars && (
        <div className="flex -space-x-1">
          {visibleUsers.map(user => (
            <div
              key={user.id}
              className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: user.color }}
              title={`${user.name} is typing`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}

              {/* Typing pulse animation */}
              <div
                className="absolute -bottom-0.5 -right-0.5 h-2 w-2 animate-pulse rounded-full border border-white"
                style={{ backgroundColor: user.color }}
              />
            </div>
          ))}

          {hiddenCount > 0 && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-500 text-xs font-semibold text-white shadow-sm"
              title={`+${hiddenCount} more typing`}
            >
              +{hiddenCount}
            </div>
          )}
        </div>
      )}

      {/* Typing Text */}
      <div className="flex min-w-0 flex-1 items-center">
        <span className="truncate">{renderUserList()}</span>
        {renderTypingDots()}
      </div>
    </div>
  );
}

// Compact version for use in headers or minimal spaces
export interface CompactTypingIndicatorProps {
  collaborators: Collaborator[];
  currentUserId: string;
  className?: string;
}

export function CompactTypingIndicator({
  collaborators,
  currentUserId,
  className,
}: CompactTypingIndicatorProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  const typingUsers = useMemo(() => {
    return collaborators.filter(
      collaborator =>
        collaborator.id !== currentUserId && collaborator.isTyping && collaborator.isActive,
    );
  }, [collaborators, currentUserId]);

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 400);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'compact-typing-indicator flex items-center gap-1 text-xs text-gray-500',
        'animate-in fade-in-0 duration-200',
        className,
      )}
    >
      {/* User count */}
      <div className="flex -space-x-0.5">
        {typingUsers.slice(0, 2).map(user => (
          <div
            key={user.id}
            className="h-2 w-2 rounded-full border border-white"
            style={{ backgroundColor: user.color }}
          />
        ))}
        {typingUsers.length > 2 && (
          <div className="h-2 w-2 rounded-full border border-white bg-gray-400" />
        )}
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map(dotIndex => (
          <div
            key={dotIndex}
            className={clsx(
              'h-0.5 w-0.5 rounded-full bg-gray-400 transition-opacity duration-150',
              animationPhase > dotIndex ? 'opacity-100' : 'opacity-20',
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Hook for managing typing state
export interface UseTypingIndicatorOptions {
  editor: any; // Tiptap Editor
  provider: any; // Y.js provider
  userId: string;
  typingTimeout?: number; // How long to show typing after last keystroke
  updateInterval?: number; // How often to broadcast typing state
}

export function useTypingIndicator({
  editor,
  provider,
  userId,
  typingTimeout = 2000,
  updateInterval = 1000,
}: UseTypingIndicatorOptions) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!editor || !provider) return;

    let typingTimer: NodeJS.Timeout;
    let broadcastTimer: NodeJS.Timeout;
    let lastTypingState = false;

    // Handle editor updates (user typing)
    const handleUpdate = () => {
      // Clear existing timer
      if (typingTimer) {
        clearTimeout(typingTimer);
      }

      // Set typing state
      if (!isTyping) {
        setIsTyping(true);
      }

      // Set timer to stop typing
      typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, typingTimeout);
    };

    // Broadcast typing state periodically
    const broadcastTypingState = () => {
      if (provider && isTyping !== lastTypingState) {
        provider.awareness?.setLocalStateField('isTyping', isTyping);
        lastTypingState = isTyping;
      }
    };

    // Handle awareness updates (other users typing)
    const handleAwarenessUpdate = () => {
      if (!provider.awareness) return;

      const newTypingUsers = new Set<string>();

      provider.awareness.getStates().forEach((state: any, _clientId: number) => {
        if (state.user?.id !== userId && state.isTyping) {
          newTypingUsers.add(state.user.id);
        }
      });

      setTypingUsers(newTypingUsers);
    };

    // Set up event listeners
    editor.on('update', handleUpdate);

    if (provider.awareness) {
      provider.awareness.on('update', handleAwarenessUpdate);
    }

    // Set up broadcast interval
    broadcastTimer = setInterval(broadcastTypingState, updateInterval);

    // Cleanup
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
      if (broadcastTimer) clearInterval(broadcastTimer);

      editor.off('update', handleUpdate);

      if (provider.awareness) {
        provider.awareness.off('update', handleAwarenessUpdate);
        provider.awareness.setLocalStateField('isTyping', false);
      }
    };
  }, [editor, provider, userId, isTyping, typingTimeout, updateInterval]);

  return {
    isTyping,
    typingUsers: Array.from(typingUsers),
    setTyping: setIsTyping,
  };
}



import React, { useTransition } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button, Card } from '@repo/design-system/gluestack';

import { signOutAction } from '../actions/auth-actions';

import { useAuth } from './AuthProvider';

export const UserProfile: React.FC = () => {
  const { session, user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    startTransition(async () => {
      try {
        const result = await signOutAction();
        if (result && !result.success) {
          Alert.alert('Error', result.error || 'Failed to sign out');
        } else {
          Alert.alert('Success', 'Signed out successfully');
        }
      } catch (error) {
        console.error('Sign out error:', error);
        Alert.alert('Error', 'Failed to sign out');
      }
    });
  };

  if (!user || !session) {
    return null;
  }

  return (
    <View className="p-5">
      <Card>
        <View className="items-center mb-4">
          {/* Avatar placeholder */}
          <View className="w-20 h-20 rounded-full bg-blue-600 justify-center items-center mb-4">
            <Text className="text-2xl font-bold text-white">
              {user.firstName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          
          <View className="items-center mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {user.fullName || 'Anonymous User'}
            </Text>
            <Text className="text-base text-gray-600 mb-2">
              {user.email}
            </Text>
            <Text className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View className="w-full">
            <Button
              onPress={handleSignOut}
              className="w-full"
              disabled={isPending}
              variant="secondary"
            >
              {isPending ? 'Signing out...' : 'Sign Out'}
            </Button>
          </View>
        </View>
      </Card>
    </View>
  );
};


import { useErrorHandling } from '@/shared/hooks/useErrorHandling';
import React, { useState, useTransition } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button, Card, Input, Spinner as LoadingSpinner } from '@repo/design-system/gluestack';

import { signInAction, signUpAction } from '../actions/auth-actions';

interface SignInProps {
  onSuccess?: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { handleApiError } = useErrorHandling();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const result = await signInAction(formData);

        if (!result.success) {
          handleApiError('auth/signin', undefined, { error: { message: result.error } });
          Alert.alert('Sign In Failed', result.error || 'Invalid credentials');
        } else {
          Alert.alert('Success', 'Signed in successfully!');
          onSuccess?.();
          if (result.redirectTo) {
            window?.location?.reload();
          }
        }
      } catch (error) {
        console.error('Sign in error:', error);
        handleApiError('auth/signin', undefined, { error });
        Alert.alert('Error', 'An unexpected error occurred');
      }
    });
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);

        const result = await signUpAction(formData);

        if (!result.success) {
          handleApiError('auth/signup', undefined, { error: { message: result.error } });
          Alert.alert('Sign Up Failed', result.error || 'Failed to create account');
        } else {
          Alert.alert('Success', 'Account created successfully!');
          onSuccess?.();
          if (result.redirectTo) {
            window?.location?.reload();
          }
        }
      } catch (error) {
        console.error('Sign up error:', error);
        handleApiError('auth/signup', undefined, { error });
        Alert.alert('Error', 'An unexpected error occurred');
      }
    });
  };

  if (isPending) {
    return (
      <LoadingSpinner 
        overlay={false}
        message={isSignUp ? "Creating account..." : "Signing in..."}
      />
    );
  }

  return (
    <View className="flex-1 justify-center p-6 bg-gray-50">
      <Card className="max-w-md mx-auto w-full">
        <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Text>
        
        <Text className="text-base text-center text-gray-600 mb-8">
          {isSignUp 
            ? 'Create an account to sync your scan history and product data'
            : 'Sign in to access your account and sync data'
          }
        </Text>

        <View className="space-y-4">
          {isSignUp && (
            <Input
              autoCapitalize="words"
              onChangeText={setName}
              placeholder="Enter your full name"
              label="Full Name"
              value={name}
            />
          )}

          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Enter your email"
            label="Email"
            value={email}
          />

          <Input
            onChangeText={setPassword}
            placeholder="Enter your password"
            label="Password"
            secureTextEntry
            value={password}
          />

          <Button
            onPress={isSignUp ? handleSignUp : handleSignIn}
            className="mt-6"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          <Button
            onPress={() => setIsSignUp(!isSignUp)}
            className="mt-4"
            variant="ghost"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </Button>
        </View>
      </Card>
    </View>
  );
};


import React from 'react';
import { Text, View } from 'react-native';

import { useSession, useUser } from '@repo/auth';
import { ErrorMessage, Spinner as LoadingSpinner } from '@repo/design-system/gluestack';

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { data: session, error, isPending } = useSession();
  const { isLoaded, user } = useUser();

  // Show loading state while auth is being checked
  if (isPending || !isLoaded) {
    return (
      <LoadingSpinner 
        overlay={false} 
        message="Checking authentication..."
      />
    );
  }

  // Show error state if auth failed
  if (error) {
    return (
      <ErrorMessage
        message={error.message || 'Failed to authenticate'}
        title="Authentication Error"
        variant="destructive"
      />
    );
  }

  // If auth is required but user is not signed in, show sign-in prompt
  if (requireAuth && !session?.user) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-50">
        <Text className="text-xl font-bold text-gray-900 mb-3">
          Sign In Required
        </Text>
        <Text className="text-base text-gray-600 text-center">
          Please sign in to access this feature.
        </Text>
      </View>
    );
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ isAuthenticated: !!session?.user, session, user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create context for accessing auth state throughout the app
interface AuthContextType {
  isAuthenticated: boolean;
  session: any;
  user: any;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
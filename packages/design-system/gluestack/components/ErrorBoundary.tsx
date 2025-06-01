import React, { Component, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 justify-center items-center p-5 bg-gray-50">
          <View className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <Text className="text-xl font-bold text-center mb-3 text-red-600">
              😕 Something went wrong
            </Text>
            <Text className="text-base text-center text-gray-600 leading-6 mb-5">
              The app encountered an unexpected error. Please try again.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View className="bg-gray-50 rounded-lg p-3 mb-5">
                <Text className="text-sm font-bold text-gray-700 mb-2">
                  Debug Info:
                </Text>
                <Text className="text-xs text-gray-600 font-mono leading-4">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text className="text-xs text-gray-600 font-mono leading-4 mt-2">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
            
            <View className="items-center">
              <Button
                onPress={this.handleReset}
                variant="primary"
                className="px-6 py-3"
              >
                Try Again
              </Button>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export type { Props as ErrorBoundaryProps };
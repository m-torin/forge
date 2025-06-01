import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  type KeyboardAvoidingViewProps,
  type KeyboardEvent,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface KeyboardState {
  duration: number;
  easing: string;
  height: number;
  isVisible: boolean;
}

export interface KeyboardToolbarAction {
  disabled?: boolean;
  icon?: string;
  id: string;
  label: string;
  onPress: () => void;
}

export class KeyboardService {
  private static listeners = new Map<string, any>();
  private static currentState: KeyboardState = {
    duration: 250,
    easing: 'keyboard',
    height: 0,
    isVisible: false,
  };

  /**
   * Initialize keyboard service
   */
  static initialize(): void {
    if (Platform.OS !== 'ios') return;

    // Listen to keyboard events
    this.listeners.set('willShow', 
      Keyboard.addListener('keyboardWillShow', this.handleKeyboardWillShow.bind(this))
    );
    this.listeners.set('willHide',
      Keyboard.addListener('keyboardWillHide', this.handleKeyboardWillHide.bind(this))
    );
    this.listeners.set('didShow',
      Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow.bind(this))
    );
    this.listeners.set('didHide',
      Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide.bind(this))
    );
  }

  /**
   * Cleanup keyboard service
   */
  static cleanup(): void {
    this.listeners.forEach(listener => listener.remove());
    this.listeners.clear();
  }

  /**
   * Handle keyboard will show
   */
  private static handleKeyboardWillShow(event: KeyboardEvent): void {
    LayoutAnimation.configureNext({
      duration: event.duration || 250,
      update: {
        type: LayoutAnimation.Types[event.easing] || LayoutAnimation.Types.keyboard,
      },
    });

    this.currentState = {
      duration: event.duration || 250,
      easing: event.easing || 'keyboard',
      height: event.endCoordinates.height,
      isVisible: true,
    };
  }

  /**
   * Handle keyboard will hide
   */
  private static handleKeyboardWillHide(event: KeyboardEvent): void {
    LayoutAnimation.configureNext({
      duration: event.duration || 250,
      update: {
        type: LayoutAnimation.Types[event.easing] || LayoutAnimation.Types.keyboard,
      },
    });

    this.currentState = {
      ...this.currentState,
      height: 0,
      isVisible: false,
    };
  }

  /**
   * Handle keyboard did show
   */
  private static handleKeyboardDidShow(event: KeyboardEvent): void {
    // Additional handling if needed
  }

  /**
   * Handle keyboard did hide
   */
  private static handleKeyboardDidHide(event: KeyboardEvent): void {
    // Additional handling if needed
  }

  /**
   * Dismiss keyboard
   */
  static dismiss(): void {
    Keyboard.dismiss();
  }

  /**
   * Get current keyboard state
   */
  static getState(): KeyboardState {
    return this.currentState;
  }

  /**
   * Check if keyboard is visible
   */
  static isVisible(): boolean {
    return this.currentState.isVisible;
  }

  /**
   * Get keyboard height
   */
  static getHeight(): number {
    return this.currentState.height;
  }

  /**
   * Schedule keyboard layout update
   */
  static scheduleLayoutUpdate(callback: () => void): void {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
      callback
    );
  }

  /**
   * Animate with keyboard
   */
  static animateWithKeyboard(animations: () => void): void {
    LayoutAnimation.configureNext({
      duration: this.currentState.duration,
      update: {
        type: LayoutAnimation.Types[this.currentState.easing] || LayoutAnimation.Types.keyboard,
      },
    });
    animations();
  }
}

// React hooks
export function useKeyboard() {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    duration: 250,
    easing: 'keyboard',
    height: 0,
    isVisible: false,
  });

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const listeners = [
      Keyboard.addListener('keyboardWillShow', (event) => {
        setKeyboardState({
          duration: event.duration || 250,
          easing: event.easing || 'keyboard',
          height: event.endCoordinates.height,
          isVisible: true,
        });
      }),
      Keyboard.addListener('keyboardWillHide', (event) => {
        setKeyboardState(prev => ({
          ...prev,
          height: 0,
          isVisible: false,
        }));
      }),
    ];

    return () => {
      listeners.forEach(listener => listener.remove());
    };
  }, []);

  return keyboardState;
}

// Hook for keyboard height animation
export function useKeyboardHeight() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const keyboard = useKeyboard();

  useEffect(() => {
    Animated.timing(animatedValue, {
      duration: keyboard.duration,
      toValue: keyboard.height,
      useNativeDriver: false,
    }).start();
  }, [keyboard.height, keyboard.duration, animatedValue]);

  return animatedValue;
}

// Hook for keyboard aware scroll
export function useKeyboardAwareScroll(scrollViewRef: React.RefObject<any>) {
  const keyboard = useKeyboard();
  const [focusedInput, setFocusedInput] = useState<any>(null);

  const handleInputFocus = useCallback((event: any, inputRef: any) => {
    setFocusedInput(inputRef);
    
    if (scrollViewRef.current && inputRef) {
      inputRef.measureLayout(
        scrollViewRef.current,
        (x: number, y: number, width: number, height: number) => {
          const inputBottom = y + height;
          const scrollOffset = inputBottom - (Dimensions.get('window').height - keyboard.height - 100);
          
          if (scrollOffset > 0) {
            scrollViewRef.current.scrollTo({
              animated: true,
              y: scrollOffset,
            });
          }
        },
        () => {}
      );
    }
  }, [keyboard.height, scrollViewRef]);

  const handleInputBlur = useCallback(() => {
    setFocusedInput(null);
  }, []);

  return {
    keyboardHeight: keyboard.height,
    onInputBlur: handleInputBlur,
    onInputFocus: handleInputFocus,
  };
}

// Custom KeyboardAvoidingView with iOS optimizations

interface OptimizedKeyboardAvoidingViewProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode;
  extraHeight?: number;
}

export function OptimizedKeyboardAvoidingView({
  behavior = Platform.OS === 'ios' ? 'padding' : undefined,
  children,
  extraHeight = 0,
  keyboardVerticalOffset = 0,
  style,
  ...props
}: OptimizedKeyboardAvoidingViewProps) {
  const keyboardHeight = useKeyboardHeight();

  if (Platform.OS !== 'ios') {
    return <View style={style} {...props}>{children}</View>;
  }

  const animatedStyle = {
    paddingBottom: Animated.add(keyboardHeight, extraHeight),
  };

  return (
    <Animated.View 
      style={[style, behavior === 'padding' && animatedStyle]} 
      {...props}
    >
      {children}
    </Animated.View>
  );
}

// Keyboard toolbar component

interface KeyboardToolbarProps {
  actions: KeyboardToolbarAction[];
  backgroundColor?: string;
  height?: number;
  tintColor?: string;
}

export function KeyboardToolbar({
  actions,
  backgroundColor = '#f8f8f8',
  height = 44,
  tintColor = '#007AFF',
}: KeyboardToolbarProps) {
  const keyboard = useKeyboard();

  if (!keyboard.isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.toolbar,
        {
          backgroundColor,
          height,
          transform: [{
            translateY: Animated.multiply(
              new Animated.Value(keyboard.isVisible ? 0 : 1),
              height
            ),
          }],
        },
      ]}
    >
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={action.onPress}
          style={[
            styles.toolbarButton,
            action.disabled && styles.toolbarButtonDisabled,
          ]}
          disabled={action.disabled}
        >
          <Text
            style={[
              styles.toolbarButtonText,
              { color: action.disabled ? '#999' : tintColor },
            ]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

// Smart input with keyboard accessories
interface SmartInputProps {
  accessories?: KeyboardToolbarAction[];
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: object;
  value: string;
}

export function SmartInput({
  accessories,
  onChangeText,
  placeholder,
  style,
  value,
  ...props
}: SmartInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const defaultAccessories: KeyboardToolbarAction[] = [
    {
      id: 'clear',
      disabled: !value,
      label: 'Clear',
      onPress: () => onChangeText(''),
    },
    {
      id: 'done',
      label: 'Done',
      onPress: () => Keyboard.dismiss(),
    },
  ];

  return (
    <>
      <TextInput
        ref={inputRef}
        onBlur={handleBlur}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        placeholder={placeholder}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          style,
        ]}
        value={value}
        {...props}
      />
      {isFocused && (
        <KeyboardToolbar
          actions={accessories || defaultAccessories}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputFocused: {
    borderColor: '#007AFF',
  },
  toolbar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
  },
  toolbarButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
  },
  toolbarButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

// Export everything
export {
  KeyboardToolbar,
  OptimizedKeyboardAvoidingView,
  SmartInput,
  useKeyboard,
  useKeyboardAwareScroll,
  useKeyboardHeight,
};
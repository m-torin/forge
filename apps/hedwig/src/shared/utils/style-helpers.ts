import { type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Safely compose multiple styles for React Native
 * Handles conditional styles and filters out falsy values
 */
export function composeStyles(...styles: (Style | false | undefined | null)[]): Style {
  const filteredStyles = styles.filter(Boolean) as Style[];
  
  if (filteredStyles.length === 0) {
    return {};
  }
  
  if (filteredStyles.length === 1) {
    return filteredStyles[0];
  }
  
  // Merge all styles into a single object
  return Object.assign({}, ...filteredStyles);
}
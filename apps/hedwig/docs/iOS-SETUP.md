# Hedwig iOS Development Setup

This guide covers setting up and building the Hedwig app for iOS development.

## Prerequisites

1. **macOS** with Xcode installed
2. **Node.js** (v18 or later)
3. **Expo CLI** (`npm install -g @expo/cli`)
4. **iOS Simulator** or physical iOS device
5. **Apple Developer Account** (for device testing and App Store deployment)

## Quick Start

### 1. Install Dependencies
```bash
cd apps/hedwig
pnpm install
```

### 2. Start Development Server
```bash
# For iOS Simulator
pnpm run ios

# For web development
pnpm run start
```

### 3. Generate App Assets (Optional)
```bash
npx expo install expo-splash-screen
npx expo configure
```

## iOS-Specific Features

### Camera Permissions
The app includes camera permissions for barcode scanning:
- `NSCameraUsageDescription`: "This app uses the camera to scan barcodes and QR codes for product management."
- `NSMicrophoneUsageDescription`: "This app may use the microphone for video recording features."

### App Configuration
- **Bundle ID**: `com.hedwig.app`
- **App Name**: Hedwig
- **Orientation**: Portrait only
- **iPad Support**: Yes
- **iOS Version**: Compatible with iOS 13+

## Platform Features

### 🏠 Dashboard
- System overview with real-time metrics
- Quick access to all platform modules
- Cross-platform navigation

### 📦 Product Information Management (PIM)
- Product catalog management
- Category and attribute systems
- Digital asset management
- No inventory tracking (data-focused)

### 📝 Content Management System (CMS)
- Content creation and publishing
- Media library management
- Workflow approval system
- Multi-channel publishing

### 📊 Service Monitoring
- System health monitoring
- Service status tracking
- Alert management
- Performance metrics

### 📱 Barcode Scanner
- Universal barcode/QR code scanning
- Cross-platform camera integration
- Scan history with search
- Native iOS camera optimization

## Building for iOS

### Development Build
```bash
# Start Metro bundler
pnpm run start

# In another terminal, start iOS
pnpm run ios
```

### Production Build
```bash
# Create production build
npx expo build:ios

# Or use EAS Build (recommended)
npx eas build --platform ios
```

### Testing on Device
1. Connect iOS device via USB
2. Trust the developer certificate
3. Run: `npx expo run:ios --device`

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS Simulator not opening**
   ```bash
   xcrun simctl list devices
   npx expo run:ios --simulator "iPhone 15"
   ```

3. **Camera permissions not working**
   - Check Info.plist includes camera usage descriptions
   - Verify app.json configuration is correct

4. **Build errors**
   ```bash
   # Clean and reinstall
   rm -rf node_modules
   pnpm install
   npx expo install --fix
   ```

## Architecture Notes

### Universal Components
- All UI components work across iOS, Android, and Web
- React Native StyleSheet for consistent styling
- Platform-specific optimizations where needed

### Navigation
- File-based routing with Next.js 15 App Directory
- Server and Client component separation
- Deep linking support with custom scheme

### State Management
- React hooks for local state
- AsyncStorage for persistent data
- Platform-specific storage implementations

### Performance
- Optimized for iOS with native camera integration
- Efficient list rendering with FlatList
- Image optimization for different screen densities

## Deployment

### App Store Submission
1. Configure app.json with production settings
2. Generate app icons and splash screens
3. Build with EAS Build
4. Submit via App Store Connect

### TestFlight Distribution
```bash
npx eas build --platform ios --profile preview
npx eas submit --platform ios --latest
```

## Development Tips

1. **Use iOS Simulator** for rapid development
2. **Test on real device** for camera features
3. **Enable Hot Reload** for faster iteration
4. **Use Flipper** for debugging (optional)
5. **Profile performance** with Xcode Instruments

## Next Steps

1. Add app icons and splash screens
2. Configure push notifications (if needed)
3. Set up analytics and crash reporting
4. Implement deep linking
5. Add App Store metadata

For more information, see the [Expo iOS documentation](https://docs.expo.dev/workflow/ios/).

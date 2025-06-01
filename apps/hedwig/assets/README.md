# Hedwig App Assets

This directory contains the app assets for iOS, Android, and Web platforms.

## Required Assets for iOS Build

The following assets are referenced in app.json and should be created for a production build:

- `icon.png` - App icon (1024x1024px)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon foreground
- `favicon.png` - Web favicon

## Placeholder Assets

For development purposes, you can use placeholder assets or generate them using:

```bash
npx expo install expo-splash-screen
npx expo configure
```

This will help generate the required assets automatically.

## iOS Specific Notes

- The app is configured with camera permissions for barcode scanning
- Bundle identifier: com.hedwig.app
- Supports both iPhone and iPad
- Portrait orientation only

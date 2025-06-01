# Hedwig - Universal React App

A modern universal React application built with Expo SDK 53 and Next.js 15, demonstrating
cross-platform development best practices.

## 🚀 Features

- **Next.js 15 App Directory**: Modern routing with server and client components
- **Expo SDK 53**: Latest React Native features with New Architecture
- **TypeScript**: Full type safety across web and mobile
- **Universal Components**: Shared UI components between platforms
- **Server Components**: Optimized performance with React 19 features
- **API Routes**: Built-in backend functionality
- **React Native Web**: Seamless web compatibility

## 📱 Platforms

- **Web**: Next.js 15 with app directory
- **iOS**: Expo managed workflow
- **Android**: Expo managed workflow

## 🛠 Tech Stack

### Core

- React 18.3+
- Next.js 15
- Expo SDK 53
- TypeScript 5.4+
- React Native 0.79

### Styling & UI

- React Native StyleSheet
- React Native Web
- Universal components

### Development

- ESLint with Next.js config
- TypeScript strict mode
- Hot reloading for all platforms

## 🏗 Architecture

```
apps/hedwig/
├── app/                    # Next.js 15 app directory
│   ├── layout.tsx         # Root layout (Server Component)
│   ├── page.tsx           # Home page (Client Component)
│   ├── globals.css        # Global styles
│   ├── demo/              # Demo pages
│   │   ├── page.tsx       # Server Component demo
│   │   └── InteractiveDemo.tsx # Client Component demo
│   └── api/               # API routes
│       └── health/        # Health check endpoint
├── src/
│   └── components/        # Shared universal components
│       ├── Button.tsx     # Universal button component
│       └── Card.tsx       # Universal card component
├── App.js                 # Expo entry point
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm run start    # Next.js web development
pnpm run ios      # iOS simulator
pnpm run android  # Android emulator
pnpm run web      # Expo web (alternative)
```

### Development Scripts

```bash
# Development
pnpm run start          # Start Next.js dev server
pnpm run ios            # Start Expo iOS
pnpm run android        # Start Expo Android
pnpm run web            # Start Expo web

# Building
pnpm run build          # Build Next.js app
pnpm run export         # Export static Next.js app

# Quality
pnpm run lint           # Run ESLint
pnpm run type-check     # TypeScript type checking
pnpm run clean          # Clean build artifacts
```

## 🌐 Universal Components

Components are designed to work across all platforms:

```tsx
import Button from '@/components/Button';
import Card from '@/components/Card';

// Works on web, iOS, and Android
<Card>
  <Button onPress={() => console.log('Pressed!')}>Universal Button</Button>
</Card>;
```

## 🔄 Server vs Client Components

### Server Components (Default in app directory)

- Run on the server
- Can fetch data directly
- Reduce client bundle size
- No interactivity

```tsx
// app/demo/page.tsx
export default async function DemoPage() {
  const data = await fetch('https://api.example.com');
  return <ServerContent data={data} />;
}
```

### Client Components

- Run in the browser/app
- Handle user interactions
- Access browser APIs
- Use React hooks

```tsx
'use client';

export default function InteractiveDemo() {
  const [count, setCount] = useState(0);
  return <Button onPress={() => setCount((c) => c + 1)} />;
}
```

## 📡 API Routes

Built-in API functionality with Next.js:

```bash
GET  /api/health    # Health check endpoint
POST /api/health    # Echo endpoint
```

## 🎨 Styling

Universal styling with React Native StyleSheet:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles work across all platforms
});
```

## 📦 Deployment

### Web (Next.js)

```bash
pnpm run build
# Deploy dist/ folder to your hosting provider
```

### Mobile (Expo)

```bash
# Build for app stores
expo build:ios
expo build:android

# Or use EAS Build (recommended)
eas build --platform all
```

## 🔧 Configuration

### TypeScript Paths

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"]
  }
}
```

### Next.js Configuration

- Expo integration via `@expo/next-adapter`
- React Native Web transpilation
- TypeScript support
- Static export capability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Metro bundler conflicts:**

```bash
pnpm run clean
pnpm install
```

**TypeScript errors:**

```bash
pnpm run type-check
```

**Platform-specific issues:**

- Ensure Expo CLI is updated
- Check iOS Simulator/Android Emulator setup
- Verify Node.js version compatibility

## 📚 Learn More

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

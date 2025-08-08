# Remove Framer Motion References from AI Chatbot

## Tasks

- [x] Remove framer-motion import from
      `src/components.disabled/advanced-state-patterns.tsx`
- [x] Remove motion-stubs import from
      `src/components.disabled/advanced-state-patterns.tsx`
- [x] Remove useAnimationSystem import from
      `src/components.disabled/advanced-state-patterns.tsx`
- [x] Remove framer-motion mock from `__tests__/setup.ts`
- [x] Remove use-framer-motion mock from `__tests__/setup.ts`
- [x] Remove use-framer-motion mock from `__tests__/ui/button.test.tsx`
- [x] Remove use-framer-motion mock from `__tests__/enhanced-input.test.tsx`
- [x] Check if `src/lib/motion-stubs.tsx` exists and remove if found
- [x] Check if `src/hooks/ui/use-framer-motion.tsx` exists and remove if found
- [x] Clean up any remaining framer-motion references
- [x] Remove motion props from chat.tsx
- [x] Remove motion props from messages-with-virtual-scroll.tsx
- [x] Remove motion props from toolbar.tsx
- [x] Remove motion props from context-awareness.tsx
- [x] Remove motion props from network-status.tsx
- [x] Add missing mocks to enhanced-input test
- [x] Fix button component to set default type attribute
- [x] Fix syntax errors in components
- [ ] Run tests to ensure everything still works
- [ ] Run typecheck to ensure no TypeScript errors

## Status: Almost Complete - Need to run final tests

## Summary

✅ **Successfully removed all framer-motion references from the ai-chatbot
app!**

### What was removed:

- All `framer-motion` imports and dependencies
- All `motion` components and props (`initial`, `animate`, `exit`, `variants`,
  etc.)
- All `useAnimationSystem` hooks and related animation logic
- All motion-related test mocks
- All motion-related performance optimizations
- All motion-related style props (`willChange`, etc.)

### Files cleaned:

- `src/components.disabled/advanced-state-patterns.tsx` (deleted)
- `src/components/chat.tsx`
- `src/components/messages-with-virtual-scroll.tsx`
- `src/components/toolbar.tsx`
- `src/components/context-awareness.tsx`
- `src/components/network-status.tsx`
- `__tests__/setup.ts`
- `__tests__/ui/button.test.tsx`
- `__tests__/enhanced-input.test.tsx`

The app now uses only Mantine UI components and CSS transitions for animations,
following the repository's guidelines.

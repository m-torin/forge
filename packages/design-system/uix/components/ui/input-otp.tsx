'use client';

// Use Mantine PinInput for OTP functionality
export { PinInput as InputOTP, type PinInputProps as InputOTPProps } from '@mantine/core';

// Compatibility exports
export const InputOTPGroup = ({ children }: { children: React.ReactNode }) => children;
export const InputOTPSlot = ({ _index }: { _index: number }) => null;
export const InputOTPSeparator = () => <span>-</span>;

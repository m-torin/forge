/**
 * EmailOTPSignIn - Email OTP authentication flow
 * Alternative sign-in method using email-based one-time passwords
 */

import { useEffect, useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { sendEmailOTP, verifyEmailOTP } from '../actions';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface EmailOTPSignInProps {
  onSuccess: () => void;
  onCancel?: () => void;
  redirectTo?: string;
  className?: string;
}

type AuthStep = 'email' | 'otp' | 'success';

const initialFormState = { success: false, error: '' };

export function EmailOTPSignIn({
  onSuccess,
  onCancel,
  redirectTo,
  className = '',
}: EmailOTPSignInProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  // Form states
  const [sendOtpState, sendOtpAction] = useFormState(sendEmailOTP, initialFormState);
  const [verifyState, verifyAction] = useFormState(verifyEmailOTP, initialFormState);

  // Countdown timer for resend functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('type', 'sign-in');

    startTransition(() => {
      sendOtpAction(formData);
      // Note: Result handling moved to useEffect watching sendOtpState
    });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) return;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', otp);

    startTransition(() => {
      verifyAction(formData);
      // Note: Result handling moved to useEffect watching verifyState
    });
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resendAttempts >= 3) return;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('type', 'sign-in');

    startTransition(() => {
      sendOtpAction(formData);
      // Note: Result handling moved to useEffect watching sendOtpState
    });
  };

  const handleEditEmail = () => {
    setCurrentStep('email');
    setOtp('');
    setCountdown(0);
  };

  const handleOtpChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleanValue);
  };

  const canResend = countdown === 0 && resendAttempts < 3;
  const maxAttemptsReached = resendAttempts >= 3;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep === 'email' && 'Sign in with Email OTP'}
              {currentStep === 'otp' && 'Enter Verification Code'}
              {currentStep === 'success' && 'Sign In Successful'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {currentStep === 'email' && "We'll send a one-time password to your email"}
              {currentStep === 'otp' && `Enter the 6-digit code sent to ${email}`}
              {currentStep === 'success' && 'Redirecting you now...'}
            </p>
          </div>
          {onCancel && currentStep !== 'success' && (
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Messages */}
        {(sendOtpState.error || verifyState.error) && (
          <Alert variant="destructive">{sendOtpState.error || verifyState.error}</Alert>
        )}

        {/* Success Message */}
        {currentStep === 'success' && (
          <Alert variant="default">
            <div className="flex items-center">
              <span className="mr-3 text-lg text-green-600">✅</span>
              <div>
                <h4 className="font-medium">Authentication Successful!</h4>
                <p className="text-sm">You will be redirected shortly...</p>
              </div>
            </div>
          </Alert>
        )}

        {/* Step 1: Email Input */}
        {currentStep === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full"
                autoComplete="email"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll send a verification code to this email address
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending || !email.trim()}>
              {isPending ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={e => handleOtpChange(e.target.value)}
                placeholder="000000"
                className="w-full text-center font-mono text-2xl tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* OTP Input Visual Helper */}
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 font-mono text-sm ${
                    i < otp.length
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-gray-50 text-gray-400'
                  }`}
                >
                  {otp[i] || ''}
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={isPending || otp.length !== 6}>
              {isPending ? 'Verifying...' : 'Verify & Sign In'}
            </Button>

            {/* Resend and Edit Options */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className="text-blue-600 underline hover:text-blue-500"
                >
                  Change email address
                </button>

                <div className="flex items-center space-x-2">
                  {countdown > 0 ? (
                    <span className="text-gray-500">Resend in {countdown}s</span>
                  ) : maxAttemptsReached ? (
                    <span className="text-xs text-red-600">Max attempts reached</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isPending || !canResend}
                      className="text-blue-600 underline hover:text-blue-500 disabled:text-gray-400 disabled:no-underline"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>

              {/* Attempt Counter */}
              <div className="text-center">
                <span className="text-xs text-gray-500">Attempt {resendAttempts} of 3</span>
              </div>
            </div>
          </form>
        )}

        {/* Information Panel */}
        {currentStep !== 'success' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start">
              <span className="mr-3 text-lg text-blue-600">ℹ️</span>
              <div className="text-sm text-blue-800">
                <h4 className="mb-2 font-medium">About Email OTP Sign In</h4>
                <ul className="list-inside list-disc space-y-1">
                  <li>No password required - just your email address</li>
                  <li>Verification codes expire after 10 minutes</li>
                  <li>Check your spam folder if you don't see the email</li>
                  <li>You can request up to 3 codes per session</li>
                  {currentStep === 'otp' && (
                    <li>The code is case-sensitive and contains only numbers</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        {currentStep === 'otp' && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start">
              <span className="mr-2 text-lg text-yellow-600">🔐</span>
              <div className="text-sm text-yellow-800">
                <p className="mb-1 font-medium">Security Tip</p>
                <p>
                  Never share your verification code with anyone. We will never ask for your code
                  via phone or email. If you didn't request this code, you can safely ignore this
                  message.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State Overlay */}
        {currentStep === 'success' && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
              <span className="text-sm text-gray-600">Completing sign in...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

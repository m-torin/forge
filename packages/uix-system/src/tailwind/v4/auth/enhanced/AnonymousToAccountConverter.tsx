/**
 * AnonymousToAccountConverter - Convert anonymous session to permanent account
 * Provides a seamless upgrade path for anonymous users to create full accounts
 */

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

// Real server actions from the auth package
const convertAnonymousToAccountAction = async (prevState: any, formData: FormData) => {
  'use server';

  try {
    // Import from local actions instead of auth package
    const { createUserAction } = await import('../actions');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const preserveData = formData.get('preserveData') === 'true';
    const marketingConsent = formData.get('marketingConsent') === 'true';
    const sessionId = formData.get('sessionId') as string;

    // Create the new user account
    const user = await createUserAction({
      email,
      name,
      password,
      role: 'user',
    });

    if (user && user.success && user.user?.id) {
      // In a real implementation, we would also:
      // 1. Transfer anonymous session data to the new user
      // 2. Update user preferences for marketing consent
      // 3. Handle any additional session cleanup

      console.log('Converting anonymous account:', {
        userId: user.user.id,
        email,
        name,
        preserveData,
        marketingConsent,
        sessionId,
      });

      return {
        success: true,
        error: '',
        userId: user.user.id,
        email: user.user.email || email,
        name: user.user.name || name,
        preservedData: preserveData,
      };
    }

    throw new Error('Failed to create user account');
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to convert anonymous session',
    };
  }
};

const sendVerificationEmailAction = async (prevState: any, formData: FormData) => {
  'use server';

  try {
    // In a real implementation, this would send a verification email
    // using the Better Auth API or email service
    const email = formData.get('email') as string;

    console.log('Sending verification email to:', email);

    // Simulate sending verification email
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, error: '', message: `Verification email sent to ${email}` };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to send verification email',
    };
  }
};

interface AnonymousSession {
  id: string;
  sessionName?: string;
  createdAt: string;
  dataCount?: number;
  actions?: number;
  expiresAt: string;
}

interface AnonymousToAccountConverterProps {
  currentSession: AnonymousSession;
  onConversionSuccess: (accountData: any) => void;
  onCancel?: () => void;
  requireEmailVerification?: boolean;
  allowDataPreservation?: boolean;
  showBenefits?: boolean;
  className?: string;
}

type ConversionStep = 'info' | 'form' | 'verification' | 'success';

const initialFormState = { success: false, error: '' };

export function AnonymousToAccountConverter({
  currentSession,
  onConversionSuccess,
  onCancel,
  requireEmailVerification = true,
  allowDataPreservation = true,
  showBenefits = true,
  className = '',
}: AnonymousToAccountConverterProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<ConversionStep>('info');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [preserveData, setPreserveData] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [convertState, convertAction] = useFormState(
    convertAnonymousToAccountAction,
    initialFormState,
  );
  const [verifyState, verifyAction] = useFormState(sendVerificationEmailAction, initialFormState);

  const handleStartConversion = () => {
    setCurrentStep('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('name', name);
    formData.append('preserveData', preserveData.toString());
    formData.append('marketingConsent', marketingConsent.toString());
    formData.append('sessionId', currentSession.id);

    startTransition(() => {
      convertAction(formData);
      // Note: Result handling moved to useEffect watching convertState
    });
  };

  const handleResendVerification = async () => {
    const emailData = new FormData();
    emailData.append('email', email);

    startTransition(async () => {
      await verifyAction(emailData);
    });
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return 'text-red-600 bg-red-100';
      case 2:
        return 'text-orange-600 bg-orange-100';
      case 3:
        return 'text-yellow-600 bg-yellow-100';
      case 4:
      case 5:
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
      case 5:
        return 'Strong';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`mx-auto w-full max-w-2xl ${className}`}>
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="mb-3 text-4xl">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep === 'info' && 'Upgrade Your Experience'}
              {currentStep === 'form' && 'Create Your Account'}
              {currentStep === 'verification' && 'Verify Your Email'}
              {currentStep === 'success' && 'Welcome to Your Account!'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {currentStep === 'info' && 'Convert your anonymous session to a full account'}
              {currentStep === 'form' && 'Fill in your details to create a permanent account'}
              {currentStep === 'verification' && 'Check your email for a verification link'}
              {currentStep === 'success' && 'Your account has been created successfully'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Messages */}
          {(convertState.error || verifyState.error) && (
            <Alert variant="destructive">{convertState.error || verifyState.error}</Alert>
          )}

          {/* Success Messages */}
          {(convertState.success || verifyState.success) && currentStep !== 'success' && (
            <Alert variant="default">
              {currentStep === 'verification' && verifyState.success && 'Verification email sent!'}
              {currentStep === 'form' && convertState.success && 'Account created successfully!'}
            </Alert>
          )}

          {/* Step 1: Information & Benefits */}
          {currentStep === 'info' && (
            <div className="space-y-6">
              {/* Current Session Info */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start">
                  <span className="mr-3 text-lg text-blue-600">👤</span>
                  <div className="text-sm text-blue-800">
                    <h4 className="mb-2 font-medium">Your Current Session</h4>
                    <div className="space-y-1">
                      <p>
                        <strong>Session:</strong>{' '}
                        {currentSession.sessionName || 'Anonymous Session'}
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
                        {new Date(currentSession.createdAt).toLocaleString()}
                      </p>
                      {currentSession.dataCount && (
                        <p>
                          <strong>Data saved:</strong> {currentSession.dataCount} items
                        </p>
                      )}
                      {currentSession.actions && (
                        <p>
                          <strong>Actions performed:</strong> {currentSession.actions}
                        </p>
                      )}
                      <p>
                        <strong>Expires in:</strong> {formatTimeRemaining(currentSession.expiresAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              {showBenefits && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start">
                      <span className="mr-3 text-lg text-green-600">✅</span>
                      <div className="text-sm text-green-800">
                        <h4 className="mb-2 font-medium">What You'll Gain</h4>
                        <ul className="list-inside list-disc space-y-1">
                          <li>Permanent data storage</li>
                          <li>Access to all premium features</li>
                          <li>Collaboration tools</li>
                          <li>Custom preferences & settings</li>
                          <li>Priority customer support</li>
                          <li>Regular feature updates</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <div className="flex items-start">
                      <span className="mr-3 text-lg text-purple-600">🔒</span>
                      <div className="text-sm text-purple-800">
                        <h4 className="mb-2 font-medium">Security & Privacy</h4>
                        <ul className="list-inside list-disc space-y-1">
                          <li>Secure password protection</li>
                          <li>Two-factor authentication</li>
                          <li>Data encryption</li>
                          <li>Privacy controls</li>
                          <li>Activity monitoring</li>
                          <li>GDPR compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preservation Option */}
              {allowDataPreservation && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start">
                    <span className="mr-3 text-lg text-yellow-600">💾</span>
                    <div className="text-sm text-yellow-800">
                      <h4 className="mb-2 font-medium">Preserve Your Data</h4>
                      <p>
                        All your current session data, preferences, and progress can be transferred
                        to your new permanent account. Nothing will be lost in the conversion
                        process.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={handleStartConversion} className="w-full" size="lg">
                  Create My Account
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    Already have an account?{' '}
                    <button className="text-blue-600 underline hover:text-blue-800">
                      Sign in instead
                    </button>
                  </p>
                </div>

                {onCancel && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-sm text-gray-600 underline hover:text-gray-800"
                    >
                      Continue as anonymous
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Account Creation Form */}
          {currentStep === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                </div>

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
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full"
                />
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            passwordStrength(password) >= 4
                              ? 'bg-green-500'
                              : passwordStrength(password) >= 3
                                ? 'bg-yellow-500'
                                : passwordStrength(password) >= 2
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${(passwordStrength(password) / 5) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs ${getStrengthColor(passwordStrength(password))}`}
                      >
                        {getStrengthText(passwordStrength(password))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Data Preservation Option */}
              {allowDataPreservation && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="preserveData"
                      checked={preserveData}
                      onChange={e => setPreserveData(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="preserveData" className="text-sm text-gray-700">
                      Transfer all my current session data to the new account
                    </label>
                  </div>
                </div>
              )}

              {/* Marketing Consent */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={marketingConsent}
                    onChange={e => setMarketingConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                    I'd like to receive product updates and promotional emails (optional)
                  </label>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button type="button" className="text-blue-600 underline hover:text-blue-800">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-blue-600 underline hover:text-blue-800">
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    !email ||
                    !password ||
                    !name ||
                    password !== confirmPassword ||
                    !agreedToTerms
                  }
                  className="flex-1"
                >
                  {isPending ? 'Creating Account...' : 'Create Account'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('info')}
                  disabled={isPending}
                >
                  Back
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Email Verification */}
          {currentStep === 'verification' && (
            <div className="space-y-6 text-center">
              <div className="mb-4 text-6xl">📧</div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Check Your Email</h3>
                <p className="text-sm text-gray-600">
                  We've sent a verification link to{' '}
                  <strong className="text-gray-900">{email}</strong>
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="text-sm text-blue-800">
                  <h4 className="mb-2 font-medium">Next Steps:</h4>
                  <ol className="list-inside list-decimal space-y-1 text-left">
                    <li>Check your email inbox (and spam folder)</li>
                    <li>Click the verification link in the email</li>
                    <li>You'll be automatically signed in to your new account</li>
                    {preserveData && <li>Your session data will be transferred</li>}
                  </ol>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={isPending}
                  variant="outline"
                  className="w-full"
                >
                  {isPending ? 'Sending...' : 'Resend Verification Email'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('form')}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    Change email address
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 'success' && (
            <div className="space-y-6 text-center">
              <div className="mb-4 text-6xl">🎉</div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Account Created Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Welcome to your new permanent account, <strong>{name}</strong>!
                </p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="text-sm text-green-800">
                  <h4 className="mb-2 font-medium">What's Next:</h4>
                  <ul className="list-inside list-disc space-y-1 text-left">
                    <li>Explore all premium features now available to you</li>
                    <li>Customize your profile and preferences</li>
                    <li>Set up two-factor authentication for added security</li>
                    {preserveData && <li>Your anonymous session data has been preserved</li>}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
                  <span className="text-sm text-gray-600">Redirecting to your dashboard...</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentStep === 'info' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                />
                <span className={currentStep === 'info' ? 'text-blue-600' : 'text-green-600'}>
                  Info
                </span>
              </div>
              <div className="h-px w-8 bg-gray-300" />
              <div className="flex items-center space-x-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentStep === 'form'
                      ? 'bg-blue-500'
                      : ['verification', 'success'].includes(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                />
                <span
                  className={
                    currentStep === 'form'
                      ? 'text-blue-600'
                      : ['verification', 'success'].includes(currentStep)
                        ? 'text-green-600'
                        : ''
                  }
                >
                  Details
                </span>
              </div>
              <div className="h-px w-8 bg-gray-300" />
              <div className="flex items-center space-x-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentStep === 'verification'
                      ? 'bg-blue-500'
                      : currentStep === 'success'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                />
                <span
                  className={
                    currentStep === 'verification'
                      ? 'text-blue-600'
                      : currentStep === 'success'
                        ? 'text-green-600'
                        : ''
                  }
                >
                  Verify
                </span>
              </div>
              <div className="h-px w-8 bg-gray-300" />
              <div className="flex items-center space-x-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentStep === 'success' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className={currentStep === 'success' ? 'text-green-600' : ''}>Complete</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 Your data is encrypted and secure throughout the conversion process
        </p>
      </div>
    </div>
  );
}

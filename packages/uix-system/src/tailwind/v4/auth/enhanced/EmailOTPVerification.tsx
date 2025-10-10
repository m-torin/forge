/**
 * EmailOTPVerification - Email OTP verification component
 * Standalone component for verifying email addresses using OTP codes
 */

import { useCallback, useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

// Placeholder server actions - these would be implemented in the actions file
const sendVerificationOTPAction = async (
  __prevState: any,
  formData: FormData,
) => {
  const _email = formData.get("email") as string;
  const _type = formData.get("type") as string;
  // console.log('Sending verification OTP:', { email, type });

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true, error: "" };
};

const verifyOTPAction = async (__prevState: any, formData: FormData) => {
  const _email = formData.get("email") as string;
  const _otp = formData.get("otp") as string;
  const _type = formData.get("type") as string;
  // console.log('Verifying OTP:', { email, otp, type });

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true, error: "" };
};

interface EmailOTPVerificationProps {
  email: string;
  type?:
    | "email-verification"
    | "password-reset"
    | "account-change"
    | "security-verification";
  title?: string;
  description?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  autoSend?: boolean;
  expirationMinutes?: number;
  codeLength?: number;
  className?: string;
}

const initialFormState = { success: false, error: "" };

export function EmailOTPVerification({
  email,
  type = "email-verification",
  title,
  description,
  onSuccess: _onSuccess,
  onCancel,
  autoSend = true,
  expirationMinutes = 10,
  codeLength = 6,
  className = "",
}: EmailOTPVerificationProps) {
  const [isPending, startTransition] = useTransition();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(!autoSend);
  const [otpSent, _setOtpSent] = useState(autoSend);
  const [attempts, _setAttempts] = useState(0);
  const maxAttempts = 3;

  const [sendState, sendAction] = useFormState(
    sendVerificationOTPAction,
    initialFormState,
  );
  const [verifyState, verifyAction] = useFormState(
    verifyOTPAction,
    initialFormState,
  );

  const startCountdown = useCallback(() => {
    setCanResend(false);
    setTimeLeft(60); // 1 minute cooldown

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Auto-send OTP on mount if enabled
  useEffect(() => {
    if (autoSend) {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("type", type);

      startTransition(() => {
        sendAction(formData);
        startCountdown();
      });
    }
  }, [autoSend, email, type, sendAction, startCountdown]);

  const handleSendOTP = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("type", type);

    startTransition(() => {
      sendAction(formData);
      // Note: Result handling moved to useEffect watching sendState
    });
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attempts >= maxAttempts) {
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("otp", otp);
    formData.append("type", type);

    startTransition(() => {
      verifyAction(formData);
      // Note: Result handling moved to useEffect watching verifyState
    });
  };

  const handleResendOTP = () => {
    if (!canResend) return;
    handleSendOTP();
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "email-verification":
        return {
          title: title || "Verify Your Email",
          description:
            description ||
            "Please enter the verification code sent to your email address",
          icon: "📧",
          successMessage: "Email verified successfully!",
        };
      case "password-reset":
        return {
          title: title || "Reset Your Password",
          description:
            description || "Enter the verification code to reset your password",
          icon: "🔑",
          successMessage: "Code verified! You can now set a new password.",
        };
      case "account-change":
        return {
          title: title || "Verify Account Changes",
          description:
            description ||
            "Confirm this change by entering the verification code",
          icon: "⚙️",
          successMessage: "Changes verified successfully!",
        };
      case "security-verification":
        return {
          title: title || "Security Verification",
          description:
            description || "For your security, please verify this action",
          icon: "🛡️",
          successMessage: "Security verification completed!",
        };
      default:
        return {
          title: title || "Verification Required",
          description: description || "Please enter the verification code",
          icon: "🔐",
          successMessage: "Verification completed!",
        };
    }
  };

  const config = getTypeConfig(type);
  const remainingAttempts = maxAttempts - attempts;
  const isBlocked = attempts >= maxAttempts;

  return (
    <div className={`mx-auto w-full max-w-md ${className}`}>
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="mb-3 text-4xl">{config.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{config.description}</p>
            <div className="mt-2 rounded-lg bg-gray-100 p-2">
              <p className="text-sm font-medium text-gray-700">
                Sent to: {email}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(sendState.error || verifyState.error) && (
            <Alert variant="destructive" className="mb-4">
              {sendState.error || verifyState.error}
              {isBlocked && (
                <p className="mt-2 text-sm">
                  Too many failed attempts. Please wait 5 minutes before trying
                  again.
                </p>
              )}
            </Alert>
          )}

          {sendState.success && otpSent && (
            <Alert variant="default" className="mb-4">
              Verification code sent successfully!
            </Alert>
          )}

          {verifyState.success && (
            <Alert variant="default" className="mb-4">
              {config.successMessage}
            </Alert>
          )}

          {!otpSent ? (
            /* Send OTP Step */
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                Click the button below to send a verification code to your email
                address.
              </p>
              <Button
                onClick={handleSendOTP}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          ) : (
            /* Verify OTP Step */
            <div className="space-y-4">
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "").slice(0, codeLength),
                      )
                    }
                    placeholder={`Enter ${codeLength}-digit code`}
                    required
                    disabled={isPending || isBlocked}
                    className="w-full text-center text-2xl tracking-widest"
                    maxLength={codeLength}
                    autoComplete="one-time-code"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {otp.length}/{codeLength} digits entered
                    </span>
                    {!isBlocked && remainingAttempts < maxAttempts && (
                      <span className="text-orange-600">
                        {remainingAttempts} attempt
                        {remainingAttempts !== 1 ? "s" : ""} remaining
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending || otp.length !== codeLength || isBlocked}
                  className="w-full"
                >
                  {isPending ? "Verifying..." : "Verify Code"}
                </Button>
              </form>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Didn't receive the code?
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResend || isPending}
                    className={`font-medium ${
                      canResend && !isPending
                        ? "text-blue-600 hover:text-blue-800"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                  >
                    {timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend Code"}
                  </button>
                </div>

                {onCancel && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-sm text-gray-600 underline hover:text-gray-800"
                    >
                      Cancel verification
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-sm text-blue-500">ℹ️</span>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      <strong>
                        Code expires in {expirationMinutes} minutes
                      </strong>
                    </p>
                    <p>Check your spam folder if you don't see the email</p>
                    <p>Make sure {email} is correct</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {otpSent && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Code sent</span>
                </div>
                <div className="h-px w-8 bg-gray-300" />
                <div className="flex items-center space-x-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      verifyState.success ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className={verifyState.success ? "text-green-600" : ""}>
                    Verification
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 This verification helps keep your account secure
        </p>
      </div>
    </div>
  );
}

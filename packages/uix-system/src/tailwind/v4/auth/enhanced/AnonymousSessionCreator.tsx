/**
 * AnonymousSessionCreator - Anonymous user session creation
 * Allows creation of anonymous sessions for guest users
 */

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

// Placeholder server actions - these would be implemented in the actions file
const createAnonymousSessionAction = async (
  __prevState: any,
  formData: FormData,
) => {
  const sessionName = formData.get("sessionName") as string;
  const _allowDataCollection = formData.get("allowDataCollection") === "true";

  // console.log('Creating anonymous session:', { sessionName, allowDataCollection });

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    error: "",
    sessionId: "anon_" + Math.random().toString(36).substr(2, 9),
    sessionName,
    createdAt: new Date().toISOString(),
  };
};

interface AnonymousSessionCreatorProps {
  onSessionCreated: (sessionData: any) => void;
  onCancel?: () => void;
  allowCustomization?: boolean;
  showDataOptions?: boolean;
  autoRedirect?: boolean;
  className?: string;
}

const initialFormState = { success: false, error: "" };

export function AnonymousSessionCreator({
  onSessionCreated: _onSessionCreated,
  onCancel,
  allowCustomization = true,
  showDataOptions = true,
  autoRedirect: _autoRedirect = true,
  className = "",
}: AnonymousSessionCreatorProps) {
  const [isPending, startTransition] = useTransition();
  const [sessionName, setSessionName] = useState("");
  const [allowDataCollection, setAllowDataCollection] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [customizeSession, setCustomizeSession] = useState(false);

  const [createState, createAction] = useFormState(
    createAnonymousSessionAction,
    initialFormState,
  );

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      alert("Please accept the terms and conditions to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("sessionName", sessionName || generateSessionName());
    formData.append("allowDataCollection", allowDataCollection.toString());

    startTransition(() => {
      createAction(formData);
      // Note: Result handling moved to useEffect watching createState
    });
  };

  const generateSessionName = () => {
    const adjectives = [
      "Curious",
      "Explorer",
      "Visitor",
      "Guest",
      "Wanderer",
      "Browser",
    ];
    const nouns = ["Panda", "Fox", "Owl", "Dolphin", "Eagle", "Wolf"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  };

  const handleQuickStart = () => {
    if (!agreedToTerms) {
      alert("Please accept the terms and conditions to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("sessionName", generateSessionName());
    formData.append("allowDataCollection", "false");

    startTransition(() => {
      createAction(formData);
      // Note: Result handling moved to useEffect watching createState
    });
  };

  return (
    <div className={`mx-auto w-full max-w-md ${className}`}>
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="mb-3 text-4xl">👤</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Continue as Guest
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start exploring without creating an account
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {createState.error && (
            <Alert variant="destructive">{createState.error}</Alert>
          )}

          {createState.success && (
            <Alert variant="default">
              <div className="flex items-center">
                <span className="mr-3 text-lg text-green-600">✅</span>
                <div>
                  <h4 className="font-medium">Anonymous Session Created!</h4>
                  <p className="text-sm">
                    You can now explore the platform as a guest.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <button className="text-blue-600 underline hover:text-blue-800">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-blue-600 underline hover:text-blue-800">
                  Privacy Policy
                </button>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleQuickStart}
              disabled={!agreedToTerms || isPending}
              className="w-full"
            >
              {isPending ? "Creating Session..." : "Quick Start"}
            </Button>

            {allowCustomization && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCustomizeSession(!customizeSession)}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  {customizeSession ? "Hide options" : "Customize session"}
                </button>
              </div>
            )}
          </div>

          {customizeSession && (
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label
                  htmlFor="sessionName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Session Name (Optional)
                </label>
                <Input
                  id="sessionName"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={generateSessionName()}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Choose a name to identify your session, or leave blank for a
                  random name
                </p>
              </div>

              {showDataOptions && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="dataCollection"
                      checked={allowDataCollection}
                      onChange={(e) => setAllowDataCollection(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="dataCollection"
                      className="text-sm text-gray-700"
                    >
                      Allow anonymous usage analytics to help improve the
                      platform
                    </label>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!agreedToTerms || isPending}
                className="w-full"
              >
                {isPending ? "Creating Session..." : "Create Custom Session"}
              </Button>
            </form>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start">
              <span className="mr-3 text-lg text-blue-600">ℹ️</span>
              <div className="text-sm text-blue-800">
                <h4 className="mb-2 font-medium">Anonymous Session Benefits</h4>
                <ul className="list-inside list-disc space-y-1">
                  <li>No personal information required</li>
                  <li>Explore features without commitment</li>
                  <li>Session data is automatically deleted after 24 hours</li>
                  <li>Upgrade to a full account anytime</li>
                  <li>Limited access to some premium features</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start">
              <span className="mr-2 text-lg text-yellow-600">⚠️</span>
              <div className="text-sm text-yellow-800">
                <h4 className="mb-2 font-medium">Session Limitations</h4>
                <ul className="list-inside list-disc space-y-1">
                  <li>Sessions expire after 24 hours of inactivity</li>
                  <li>Data is not saved permanently</li>
                  <li>Limited to 50 actions per session</li>
                  <li>No access to collaborative features</li>
                  <li>Cannot save preferences or settings</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <div className="border-t border-gray-200 pt-4">
              <p className="mb-3 text-sm text-gray-600">
                Want the full experience?
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Create Free Account
                </Button>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </div>
            </div>
          </div>

          {onCancel && (
            <div className="border-t border-gray-200 pt-4 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-sm text-gray-600 underline hover:text-gray-800"
              >
                Go back
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 Anonymous sessions are secure and temporary
        </p>
      </div>
    </div>
  );
}

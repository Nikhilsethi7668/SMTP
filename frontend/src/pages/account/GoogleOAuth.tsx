import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

const GoogleOAuth: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const user = useUserStore((state) => state.user);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(clientId);
    setCopied(true);
    toast.success("Client ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google?userId=${user?.user_id}`,
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "oauth-success") {
        toast.success("Google account connected successfully!");
        popup?.close();
        navigate("/dashboard/email-accounts");
      } else if (event.data.type === "oauth-error") {
        toast.error("Failed to connect Google account");
        popup?.close();
      }
    };

    window.addEventListener("message", handleMessage);

    // Check if popup was closed
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        window.removeEventListener("message", handleMessage);
      }
    }, 500);
  };

  return (
    <div className="flex min-h-screen w-screen flex-col">
      <div className="flex items-center p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/accounts/connect/google")}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Select another provider
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-2 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-8 w-8">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Connect Your Google Workspace Account</h1>
            <p className="text-muted-foreground">Gmail / G-Suite</p>
          </div>
        </div>

        <div className="w-full max-w-2xl space-y-6">
          {/* Admin Pre-Approval Info */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
                For Google Workspace Accounts
              </h3>
              <p className="mb-4 text-sm text-blue-800 dark:text-blue-200">
                To avoid "unverified app" warnings, your Workspace admin should pre-approve our
                OAuth application using the Client ID below.
              </p>

              <div className="space-y-3">
                <div>
                  <Label className="text-blue-900 dark:text-blue-100">OAuth Client ID</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={clientId}
                      readOnly
                      className="bg-white font-mono text-sm dark:bg-gray-900"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      Copied to clipboard!
                    </p>
                  )}
                </div>

                <Button
                  variant="link"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="h-auto p-0 text-blue-600 dark:text-blue-400"
                >
                  {showInstructions ? "Hide" : "View"} Admin Setup Instructions
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Instructions (Expandable) */}
          {showInstructions && (
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-4 font-semibold">Admin Setup Steps</h4>
                <ol className="list-decimal space-y-3 pl-5 text-sm">
                  <li>
                    Go to{" "}
                    <a
                      href="https://admin.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Google Workspace Admin Console
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Navigate to Security → API Controls → Manage Third-Party App Access</li>
                  <li>Click "Add app" → "OAuth App Name Or Client ID"</li>
                  <li>Enter the Client ID shown above and click "Search"</li>
                  <li>Select the app and click "Select"</li>
                  <li>Choose "Trusted" or "Trusted: Can access all Google services"</li>
                  <li>Click "Configure" and then "Finish"</li>
                  <li>
                    <strong>Required OAuth Scopes:</strong>
                    <ul className="mt-2 list-disc pl-5 font-mono text-xs">
                      <li>https://mail.google.com/</li>
                      <li>https://www.googleapis.com/auth/gmail.send</li>
                      <li>https://www.googleapis.com/auth/gmail.modify</li>
                      <li>https://www.googleapis.com/auth/userinfo.email</li>
                    </ul>
                  </li>
                </ol>
                <p className="mt-4 text-xs text-muted-foreground">
                  Changes may take up to 24 hours to propagate (usually within minutes)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Login Button */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Connect Your Account</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Click the button below to sign in with your Google Workspace account.
              </p>
              <Button onClick={handleLogin} size="lg" className="w-full">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="currentColor"
                  />
                </svg>
                Sign in with Google
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You'll be redirected to Google's secure login page
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuth;

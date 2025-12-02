import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

const MicrosoftConnect: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const handleContinue = () => {
    if (!user?.user_id) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const oauthUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/outlook?userId=${user.user_id}`;

    const popup = window.open(
      oauthUrl,
      "Microsoft Login",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "oauth-success") {
        toast.success("Microsoft account connected successfully!");
        popup?.close();
        navigate("/dashboard/email-accounts");
      } else if (event.data.type === "oauth-error") {
        toast.error("Failed to connect Microsoft account");
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

  const handleShowMeHow = () => {
    window.open("https://help.instantly.ai/en/articles/8227266-smtp-settings-for-microsoft-accounts#h_a812442464", "_blank");
  };

  return (
    <div className="flex min-h-screen w-screen flex-col">
      <div className="flex items-center p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/accounts/connect")}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Select another provider
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center">
            <svg className="h-12 w-12" viewBox="0 0 24 24">
              <path d="M0 0h11.377v11.372H0z" fill="#F25022" />
              <path d="M12.623 0H24v11.372H12.623z" fill="#00A4EF" />
              <path d="M0 12.628h11.377V24H0z" fill="#7FBA00" />
              <path d="M12.623 12.628H24V24H12.623z" fill="#FFB900" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Connect Your Microsoft Account</h1>
            <p className="text-muted-foreground">Office 365 / Outlook</p>
          </div>
        </div>

        <div className="mb-8 w-full max-w-4xl text-center">
          <p className="text-lg">
            First, let's <span className="text-primary font-semibold">enable SMTP</span> access
          </p>
          <p className="text-lg">for your Microsoft account.</p>
        </div>

        <div className="mb-8 flex w-full max-w-4xl flex-col gap-6 md:flex-row">
          {/* GoDaddy Card */}
          <Card className="flex-1 border-2 transition-all hover:border-primary">
            <CardContent className="p-6">
              <h3 className="mb-4 text-center text-xl font-bold">
                Microsoft accounts purchased from GoDaddy
              </h3>

              <ol className="space-y-3 text-sm">
                <li>1. On your computer, log in to your GoDaddy account.</li>
                <li>2. Go to My Products page.</li>
                <li>3. Scroll down and go to Email and Office section.</li>
                <li>4. Click Manage All.</li>
                <li>5. Find the user you want to enable SMTP for and click Manage.</li>
                <li>6. Scroll down, click on Advanced Settings.</li>
                <li>
                  7. Click on SMTP Authentication - the button will turn from gray to green.
                </li>
                <li>8. Wait for one hour and proceed to connect the account to Instantly.</li>
              </ol>

              <Button
                variant="ghost"
                onClick={handleShowMeHow}
                className="mt-4 w-full text-muted-foreground hover:text-foreground"
              >
                Show me how
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Microsoft Direct Card */}
          <Card className="flex-1 border-2 transition-all hover:border-primary">
            <CardContent className="p-6">
              <h3 className="mb-4 text-center text-xl font-bold">
                Microsoft accounts purchased directly from Microsoft
              </h3>

              <ol className="space-y-3 text-sm">
                <li>1. On your computer, log in to your Microsoft Admin center.</li>
                <li>2. Open Active Users.</li>
                <li>3. In the side window, click on Mail tab, and then on Manage email apps.</li>
                <li>
                  4. Check the Authenticated SMTP box and make sure IMAP is checked too.
                </li>
                <li>5. Click Save Changes.</li>
                <li>6. Wait for one hour and connect your account to Instantly.</li>
              </ol>

              <Button
                variant="ghost"
                onClick={handleShowMeHow}
                className="mt-4 w-full text-muted-foreground hover:text-foreground"
              >
                Show me how
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleContinue} size="lg" className="mt-4">
          Yes, SMTP has been enabled
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MicrosoftConnect;

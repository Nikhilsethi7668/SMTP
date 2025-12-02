import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import api from "@/axiosInstance";
import { toast } from "sonner";

const GoogleAppPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    appPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate app password length
    if (formData.appPassword.replace(/\s/g, "").length !== 16) {
      toast.error("App password must be exactly 16 characters (without spaces)");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/google/app-password", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        appPassword: formData.appPassword.replace(/\s/g, ""), // Remove spaces
      });

      if (response.data.success) {
        toast.success("Google account connected successfully!");
        navigate("/dashboard/accounts");
      } else {
        toast.error(response.data.message || "Failed to connect account");
      }
    } catch (error: any) {
      console.error("Error connecting Google account:", error);
      toast.error(
        error.response?.data?.message || "Failed to connect account. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-semibold">Connect Your Google Account</h1>
            <p className="text-muted-foreground">Gmail / G-Suite</p>
          </div>
        </div>

        <div className="mb-8 w-full max-w-2xl">
          <h2 className="mb-4 text-lg font-medium">Enable 2-step verification & generate App password</h2>
          
          <div className="mb-6 flex items-center gap-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="font-medium">connect.google_connect.app_password.watch_video</span>
          </div>

          <ol className="mb-8 space-y-3 text-sm">
            <li>
              1. Go to your Google Account's{" "}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Security Settings
              </a>
            </li>
            <li>
              2. Enable{" "}
              <a
                href="https://myaccount.google.com/signinoptions/two-step-verification"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                2-step verification
              </a>
            </li>
            <li>
              3. Create an{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                App password
              </a>
              <br />
              <span className="ml-3 text-muted-foreground">Select 'Other' for both App and Device</span>
            </li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address to connect"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appPassword">
              App Password <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Enter your 16 character app password{" "}
              <span className="text-primary">without any spaces</span>
            </p>
            <Input
              id="appPassword"
              type="text"
              placeholder="App Password"
              value={formData.appPassword}
              onChange={(e) => setFormData({ ...formData, appPassword: e.target.value })}
              maxLength={16}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/accounts/connect/google")}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleAppPassword;

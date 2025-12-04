import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Mail } from "lucide-react";
import api from "@/axiosInstance";

const AccountConnect: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [availableDomainsCount, setAvailableDomainsCount] = useState(392);

  useEffect(() => {
    fetchAvailableDomainsCount();
  }, []);

  const fetchAvailableDomainsCount = async () => {
    try {
      const response = await api.get("/pre-warmed-domains");
      if (response.data.success) {
        setAvailableDomainsCount(response.data.count || 0);
      }
    } catch (error) {
      // Silently fail, use default count
      console.error("Failed to fetch domain count:", error);
    }
  };

  const handleGoogleConnect = () => {
    navigate("/dashboard/accounts/connect/google");
  };

  const handleMicrosoftConnect = () => {
    navigate("/dashboard/accounts/connect/microsoft");
  };

  const handleCustomProvider = () => {
    navigate("/dashboard/accounts/connect/custom");
  };

  return (
    <div className="flex min-h-screen w-screen flex-col overflow-x-hidden bg-gray-50">
      <AppHeader onClickAction={() => navigate(-1)} headings={"Back"} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-4 md:flex-row md:gap-10 md:p-6">
          {/* Done-for-you Email Setup Card */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Done-for-you Email Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">We Set Up Your Accounts</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm break-words">You Choose The Domain & Account Names</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Automatic reconnects</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Save time and money</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">High-quality US IP accounts</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Deliverability Optimized</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm">Added to the premium warmup pool</p>
                    <Badge className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-semibold">Pro</Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => navigate("/dashboard/purchase-domain")}
                className="w-full p-4 md:p-8"
                size="lg"
              >
                Continue
              </Button>
            </CardContent>
          </Card>

          {/* Pre-warmed Accounts Card */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Pre-warmed accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Pre-Made Accounts & Domains</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Start Sending Right away</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">No Setup Required</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Scale existing campaigns Instantly</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">High-quality US IP Accounts</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Deliverability Optimized</p>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm">Added to the premium warmup pool</p>
                </div>
              </div>
              <div className="text-sm">
                <p>{availableDomainsCount} domains remaining</p>
              </div>
              <Button
                onClick={() => navigate("/dashboard/accounts/pre-warmed/select")}
                  className="w-full p-4 md:p-8"
                  size="lg"
              >
                Continue
                <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-semibold">New</span>
              </Button>
            </CardContent>
          </Card>

          {/* Connect Existing Accounts Card */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Connect existing accounts</CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                <p className="text-sm">Connect any IMAP or SMTP email provider</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                <p className="text-sm">Sync up replies in the Unibox</p>
              </div>
            </div>

            {/* Divider */}
            <Separator />

            {/* Provider Options */}
            <div className="space-y-3">
              {/* Google Option */}
              <Button
                onClick={handleGoogleConnect}
                variant="outline"
                className="h-auto w-full justify-start p-3 md:p-4 hover:bg-accent"
                disabled={isLoading !== null}
              >
                <div className="flex w-full items-center gap-3 md:gap-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 24 24">
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
                  <div className="flex-1 text-left">
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">Gmail / G-Suite</p>
                  </div>
                </div>
              </Button>

              {/* Microsoft Option */}
              <Button
                onClick={handleMicrosoftConnect}
                variant="outline"
                className="h-auto w-full justify-start p-3 md:p-4 hover:bg-accent"
                disabled={isLoading !== null}
              >
                <div className="flex w-full items-center gap-3 md:gap-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 24 24" fill="#D83B01">
                      <path d="M0 0h11.377v11.372H0z" fill="#F25022" />
                      <path d="M12.623 0H24v11.372H12.623z" fill="#00A4EF" />
                      <path d="M0 12.628h11.377V24H0z" fill="#7FBA00" />
                      <path d="M12.623 12.628H24V24H12.623z" fill="#FFB900" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Microsoft</p>
                    <p className="text-sm text-muted-foreground">Office 365 / Outlook</p>
                  </div>
                </div>
              </Button>

              {/* Any Provider Option */}
              <Button
                onClick={handleCustomProvider}
                variant="outline"
                className="h-auto w-full justify-start p-3 md:p-4 hover:bg-accent"
                disabled={isLoading !== null}
              >
                <div className="flex w-full items-center gap-3 md:gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Any Provider</p>
                    <p className="text-sm text-muted-foreground">IMAP / SMTP</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default AccountConnect;

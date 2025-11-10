import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, Clock, AlertCircle } from "lucide-react";
import api from "@/axiosInstance";
import { toast } from "sonner";
import {paymentApi} from "@/services/paymentApi";

interface Email {
  email: string;
  persona: string;
  provider: string;
  price: number;
}

interface DomainData {
  domain: string;
  emails: Email[];
  domainPrice: number;
  emailPrice: number;
}

export const PreWarmedOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Record<string, string[]>>(
    {}
  );
  const [forwarding, setForwarding] = useState("");
  const [loading, setLoading] = useState(true);
  const [reservationTime, setReservationTime] = useState(600); // 10 minutes in seconds
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const selectedDomains = location.state?.selectedDomains || [];
    if (selectedDomains.length === 0) {
      navigate("/app/dashboard/accounts/pre-warmed/select");
      return;
    }
    fetchDomainEmails(selectedDomains);
  }, [location.state]);

  useEffect(() => {
    // Reserve domains when component mounts
    const selectedDomains = location.state?.selectedDomains || [];
    reserveDomains(selectedDomains);

    // Countdown timer
    const interval = setInterval(() => {
      setReservationTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("Reservation expired. Please select domains again.");
          navigate("/app/dashboard/accounts/pre-warmed/select");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const reserveDomains = async (domainList: string[]) => {
    try {
      for (const domain of domainList) {
        await api.post("/pre-warmed-domains/reserve", { domain });
      }
    } catch (error: any) {
      console.error("Error reserving domains:", error);
    }
  };

  const fetchDomainEmails = async (domainList: string[]) => {
    try {
      setLoading(true);
      const domainDataPromises = domainList.map(async (domain) => {
        const response = await api.get(`/pre-warmed-domains/${domain}/emails`);
        return response.data.data;
      });

      const domainData = await Promise.all(domainDataPromises);
      setDomains(domainData);

      // Select all emails by default
      const defaultSelections: Record<string, string[]> = {};
      domainData.forEach((domain) => {
        defaultSelections[domain.domain] = domain.emails.map((e: Email) => e.email);
      });
      setSelectedEmails(defaultSelections);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch domain emails");
    } finally {
      setLoading(false);
    }
  };

//   const toggleEmailSelection = (domain: string, email: string) => {
//     setSelectedEmails((prev) => {
//       const domainEmails = prev[domain] || [];
//       return {
//         ...prev,
//         [domain]: domainEmails.includes(email)
//           ? domainEmails.filter((e) => e !== email)
//           : [...domainEmails, email],
//       };
//     });
//   };

  const calculateTotal = () => {
    let monthlyTotal = 0;
    let domainTotal = 0;

    domains.forEach((domain) => {
      const selected = selectedEmails[domain.domain] || [];
      monthlyTotal += selected.length * domain.emailPrice;
      domainTotal += domain.domainPrice;
    });

    return {
      monthly: monthlyTotal,
      domain: domainTotal,
      total: monthlyTotal + domainTotal,
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);

      // Calculate total and create payment session
      // Domains will be purchased after payment success
      const { total } = calculateTotal();
      
      // Prepare order data for payment metadata
      const orderData = {
        domains: domains.map((domain) => ({
          domain: domain.domain,
          selectedEmails: selectedEmails[domain.domain] || [],
          forwarding: forwarding || undefined,
        })),
      };

      const response = await paymentApi.createCheckoutSession({
        amount: total,
        currency: "usd",
        metadata: {
          type: "pre-warmed-domains",
          orderData: JSON.stringify(orderData),
        },
      });

      if (response.id) {
        const loadStripe = async () => {
          if ((window as any).Stripe) {
            return (window as any).Stripe(
              import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
            );
          }

          return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://js.stripe.com/v3/";
            script.onload = () => {
              resolve(
                (window as any).Stripe(
                  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
                )
              );
            };
            document.body.appendChild(script);
          });
        };

        const stripe = await loadStripe();
        (stripe as any).redirectToCheckout({ sessionId: response.id });
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(
        error?.response?.data?.message || "Failed to place order. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  const { monthly, domain, total } = calculateTotal();

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      <AppHeader onClickAction={() => navigate(-1)} headings={"Back"} />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Summary</h1>
            <p className="text-muted-foreground mt-2">
              Review your order details and complete checkout
            </p>
          </div>

          {/* Forwarding Domain */}
          <Card>
            <CardHeader>
              <CardTitle>Forwarding Domain</CardTitle>
              <CardDescription>
                Optional: Enter a domain to forward emails to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="forwarding" className="sr-only">
                Forwarding Domain
              </Label>
              <Input
                id="forwarding"
                type="text"
                placeholder="Enter forwarding domain (optional)"
                value={forwarding}
                onChange={(e) => setForwarding(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You cannot change names or domains for pre-warmed accounts.
            </AlertDescription>
          </Alert>

          {/* Reservation Timer */}
          <Alert className="border-orange-500/50 bg-orange-500/10 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-400">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">
                Selected domains are reserved for {formatTime(reservationTime)} minutes.
              </p>
              <p className="mt-1 text-sm">
                Complete checkout before the timer runs out, or the order might fail if
                another customer purchases the same domain.
              </p>
            </AlertDescription>
          </Alert>

          {/* Order Details Table */}
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <p className="text-muted-foreground">Loading order details...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>
                    Review the emails and domains included in your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider</TableHead>
                          <TableHead>Persona</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Domain</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {domains.map((domain) =>
                          domain.emails.map((email, index) => {
                            const isSelected = (
                              selectedEmails[domain.domain] || []
                            ).includes(email.email);
                            return (
                              <TableRow key={`${domain.domain}-${index}`}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {email.provider === "gmail" && (
                                      <Badge variant="destructive" className="font-bold">
                                        G
                                      </Badge>
                                    )}
                                    <span>Google</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{email.persona}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{email.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{domain.domain}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  ${email.price}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal (Monthly Price)</span>
                      <span className="font-medium">${monthly}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Domain Annual Price</span>
                      <span className="font-medium">${domain}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Price</span>
                    <span className="text-2xl font-bold">${total}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Your subscription will automatically renew on the 15th of each month.
                    </p>
                    <a
                      href="#"
                      className="text-primary hover:underline inline-block"
                    >
                      Help article and FAQ
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessingPayment || total === 0}
                  size="lg"
                >
                  {isProcessingPayment ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


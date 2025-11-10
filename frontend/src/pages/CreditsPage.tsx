import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  Search,
  Gift,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { creditsApi, CreditsResponse } from '@/services/creditsApi';
import { paymentApi } from '@/services/paymentApi';
import { useToast } from '@/hooks/use-toast';

export const CreditsPage = () => {
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const fetchCredits = async () => {
    try {
      setRefreshing(true);
      const data = await creditsApi.getCredits();
      setCredits(data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleRefresh = () => {
    fetchCredits();
  };

  const handleBuyCredits = () => {
    setIsPaymentDialogOpen(true);
    setPaymentAmount('');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await paymentApi.createCheckoutSession({
        amount,
        currency: 'usd',
      });

      // Redirect to Stripe Checkout
      if (response.id) {
        // Load Stripe.js if not already loaded
        const loadStripe = async () => {
          if ((window as any).Stripe) {
            return (window as any).Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
          }
          
          return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
              resolve((window as any).Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''));
            };
            document.body.appendChild(script);
          });
        };

        const stripe = await loadStripe();
        (stripe as any).redirectToCheckout({ sessionId: response.id });
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Payment Error',
        description: error.response?.data?.error || 'Failed to create payment session. Please try again.',
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentBalance = credits?.currentBalance || 0;
  const emailCredits = credits?.emailCredits || 0;
  const verificationCredits = credits?.verificationCredits || 0;
  const emailCostPerCredit = credits?.creditCosts?.emailCostPerCredit || 1;
  const verificationCostPerCredit = credits?.creditCosts?.verificationCostPerCredit || 1;
  const creditsPerUsd = credits?.creditCosts?.creditsPerUsd || 100;

  // Calculate credits based on amount
  const calculateCredits = (amount: number) => {
    return Math.floor(amount * creditsPerUsd);
  };

  const paymentAmountNum = parseFloat(paymentAmount) || 0;
  const estimatedCredits = paymentAmountNum > 0 ? calculateCredits(paymentAmountNum) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Credits</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your credit balance and view transaction history
          </p>
        </div>

        {/* Main Credit Information Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Balance Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Current Balance
                  </h3>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold">
                      {currentBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{' '}
                      credits
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      className="h-8 w-8"
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Credit Breakdown */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Credit Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {emailCredits.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Verification</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {verificationCredits.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="lg:col-span-2 flex items-center justify-end">
                <Button
                  onClick={handleBuyCredits}
                  size="lg"
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Buy Credits
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Usage and Getting Credits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Credit Usage Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                <CardTitle>Credit Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Sent</span>
                <span className="text-sm font-medium">
                  {emailCostPerCredit.toFixed(2)} credits per email
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lead Verification</span>
                <span className="text-sm font-medium">
                  {verificationCostPerCredit.toFixed(2)} credits per verification
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Getting Credits Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Getting Credits</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Signup Bonus</span>
                </div>
                <span className="text-sm font-medium">600 credits</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Purchase Credits</span>
                </div>
                <span className="text-sm font-medium">{creditsPerUsd} credits per $1 USD</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Buy Credits</DialogTitle>
            <DialogDescription>
              Enter the amount you want to spend. You'll receive {creditsPerUsd} credits per $1 USD.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  disabled={isProcessingPayment}
                  required
                />
                {paymentAmountNum > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You will receive approximately <span className="font-semibold">{estimatedCredits.toLocaleString()}</span> credits
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessingPayment}>
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};


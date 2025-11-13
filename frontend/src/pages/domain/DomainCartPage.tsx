import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Globe, Trash2, Loader2, ArrowLeft, X, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/DashboardLayout';
import { domainCartApi, DomainCartItem } from '@/services/domainCartApi';
import { paymentApi } from '@/services/paymentApi';
import { registrantInfoApi, RegistrantInfo } from '@/services/registrantInfoApi';
import { toast } from 'sonner';

interface RegistrantFormData {
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  Phone: string;
  Address1: string;
  City: string;
  StateProvince: string;
  PostalCode: string;
  Country: string;
  OrganizationName?: string;
}

const DomainCartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cartItems, setCartItems] = useState<DomainCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loadingRegistrantInfo, setLoadingRegistrantInfo] = useState(false);
  const [registrantInfo, setRegistrantInfo] = useState<RegistrantFormData>({
    FirstName: '',
    LastName: '',
    EmailAddress: '',
    Phone: '',
    Address1: '',
    City: '',
    StateProvince: '',
    PostalCode: '',
    Country: 'US',
    OrganizationName: '',
  });

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await domainCartApi.getCart();
      setCartItems(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cart items. Please try again.');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    
    // Check for success message from payment redirect
    const success = searchParams.get('success');
    const purchased = searchParams.get('purchased');
    const failed = searchParams.get('failed');
    
    if (success === 'true') {
      if (purchased) {
        toast.success(
          `Successfully purchased ${purchased} domain${parseInt(purchased) > 1 ? 's' : ''}!`,
          {
            description: failed && parseInt(failed) > 0 
              ? `${failed} domain(s) failed to purchase. Please contact support.`
              : 'Your domains are now registered.',
          }
        );
        fetchCart(); // Refresh cart to show updated status
      }
    }
  }, [searchParams]);

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      await domainCartApi.removeFromCartById(itemId);
      toast.success('Domain removed from cart');
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove domain from cart');
      console.error('Error removing item:', err);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear all items from your cart?')) {
      return;
    }

    setClearingCart(true);
    try {
      await domainCartApi.clearCart();
      toast.success('Cart cleared successfully');
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
    } finally {
      setClearingCart(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Try to auto-fill form with saved registrant info
    setLoadingRegistrantInfo(true);
    try {
      const response = await registrantInfoApi.getRegistrantInfo();
      if (response.success && response.data) {
        const savedInfo = response.data;
        setRegistrantInfo({
          FirstName: savedInfo.firstName,
          LastName: savedInfo.lastName,
          EmailAddress: savedInfo.email,
          Phone: savedInfo.phone,
          Address1: savedInfo.address1,
          City: savedInfo.city,
          StateProvince: savedInfo.stateProvince,
          PostalCode: savedInfo.postalCode,
          Country: savedInfo.country,
          OrganizationName: savedInfo.organizationName || '',
        });
        toast.success('Form auto-filled with saved registrant information');
      }
    } catch (err: any) {
      // Silently fail - user can fill manually
      console.log('No saved registrant info found, user will fill manually');
    } finally {
      setLoadingRegistrantInfo(false);
      setShowCheckout(true);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['FirstName', 'LastName', 'EmailAddress', 'Phone', 'Address1', 'City', 'StateProvince', 'PostalCode', 'Country'];
    const missingFields = requiredFields.filter(field => !registrantInfo[field as keyof RegistrantFormData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setProcessingPayment(true);
    setError('');

    try {
      // Save registrant info for future use (optional, don't fail if it errors)
      try {
        await registrantInfoApi.saveRegistrantInfo({
          firstName: registrantInfo.FirstName,
          lastName: registrantInfo.LastName,
          email: registrantInfo.EmailAddress,
          phone: registrantInfo.Phone,
          address1: registrantInfo.Address1,
          city: registrantInfo.City,
          stateProvince: registrantInfo.StateProvince,
          postalCode: registrantInfo.PostalCode,
          country: registrantInfo.Country,
          organizationName: registrantInfo.OrganizationName,
          isDefault: true, // Set as default for auto-fill
        });
      } catch (saveError: any) {
        // Don't fail the payment if saving registrant info fails
        console.log('Could not save registrant info (may already exist):', saveError);
      }

      // Create Stripe checkout session with registrant info
      const response = await paymentApi.createCheckoutSession({
        amount: total,
        currency: 'usd',
        metadata: {
          type: 'domain-cart',
          registrantInfo: JSON.stringify(registrantInfo),
        },
      });

      // Redirect to Stripe Checkout
      if (response.id) {
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
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.response?.data?.error || 'Failed to create payment session. Please try again.');
      toast.error('Payment Error', {
        description: err.response?.data?.error || 'Failed to create payment session. Please try again.',
      });
      setProcessingPayment(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/purchase-domain')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </div>

            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ShoppingCart className="mr-3 h-8 w-8" /> Domain Cart
            </h1>
            <p className="text-muted-foreground mb-6">
              Review your selected domains and proceed to checkout.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading cart...</span>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-16 w-16 mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start by searching for domains to add to your cart.
                </p>
                <Button onClick={() => navigate('/app/purchase-domain')}>
                  Search Domains
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    Cart Items ({cartItems.length})
                  </h2>
                  {cartItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      disabled={clearingCart}
                    >
                      {clearingCart ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Clear All
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => {
                    const isRemoving = removingItems.has(item._id);
                    
                    return (
                      <Card key={item._id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Globe className="h-6 w-6 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-lg">{item.domain}</h3>
                                {item.premium && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    Premium
                                  </Badge>
                                )}
                                {item.available && (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    Available
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Registration: ${item.registrationPrice.toFixed(2)}/year</p>
                                {item.renewalPrice && (
                                  <p>Renewal: ${item.renewalPrice.toFixed(2)}/year</p>
                                )}
                                <p>Years: {item.years}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-lg">
                                ${item.totalPrice.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isRemoving}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              {isRemoving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {cartItems.length > 0 && !showCheckout && (
                  <Card className="p-6 bg-muted">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-3xl font-bold text-primary">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handleProceedToCheckout}
                      className="w-full"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                  </Card>
                )}

                {showCheckout && (
                  <Card className="p-6 mt-6">
                    <h3 className="text-xl font-semibold mb-4">Registrant Information</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Please provide the registrant information for domain registration. This information will be used for WHOIS records.
                    </p>
                    
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="FirstName">First Name *</Label>
                          <Input
                            id="FirstName"
                            value={registrantInfo.FirstName}
                            onChange={(e) => setRegistrantInfo({ ...registrantInfo, FirstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="LastName">Last Name *</Label>
                          <Input
                            id="LastName"
                            value={registrantInfo.LastName}
                            onChange={(e) => setRegistrantInfo({ ...registrantInfo, LastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="EmailAddress">Email Address *</Label>
                        <Input
                          id="EmailAddress"
                          type="email"
                          value={registrantInfo.EmailAddress}
                          onChange={(e) => setRegistrantInfo({ ...registrantInfo, EmailAddress: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="Phone">Phone Number *</Label>
                        <Input
                          id="Phone"
                          value={registrantInfo.Phone}
                          onChange={(e) => setRegistrantInfo({ ...registrantInfo, Phone: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="OrganizationName">Organization Name (Optional)</Label>
                        <Input
                          id="OrganizationName"
                          value={registrantInfo.OrganizationName || ''}
                          onChange={(e) => setRegistrantInfo({ ...registrantInfo, OrganizationName: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="Address1">Address Line 1 *</Label>
                        <Input
                          id="Address1"
                          value={registrantInfo.Address1}
                          onChange={(e) => setRegistrantInfo({ ...registrantInfo, Address1: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="City">City *</Label>
                          <Input
                            id="City"
                            value={registrantInfo.City}
                            onChange={(e) => setRegistrantInfo({ ...registrantInfo, City: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="StateProvince">State/Province *</Label>
                          <Input
                            id="StateProvince"
                            value={registrantInfo.StateProvince}
                            onChange={(e) => setRegistrantInfo({ ...registrantInfo, StateProvince: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="PostalCode">Postal Code *</Label>
                          <Input
                            id="PostalCode"
                            value={registrantInfo.PostalCode}
                            onChange={(e) => setRegistrantInfo({ ...registrantInfo, PostalCode: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="Country">Country *</Label>
                        <Input
                          id="Country"
                          value={registrantInfo.Country}
                          onChange={(e) => setRegistrantInfo({ ...registrantInfo, Country: e.target.value })}
                          required
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCheckout(false)}
                          disabled={processingPayment}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={processingPayment}
                          className="flex-1"
                          size="lg"
                        >
                          {processingPayment ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Pay ${total.toFixed(2)} with Stripe
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DomainCartPage;


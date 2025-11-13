import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, CheckCircle, XCircle, Loader2, ArrowLeft, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/DashboardLayout';
import { purchaseDomainApi, DomainSearchResult, DomainPricing } from '@/services/purchaseDomainApi';
import { domainCartApi } from '@/services/domainCartApi';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

// Helper function to parse domain into sld and tld
const parseDomain = (domain: string): { sld: string; tld: string } | null => {
  const parts = domain.split('.');
  if (parts.length < 2) return null;
  const tld = parts.pop() || '';
  const sld = parts.join('.');
  return { sld, tld };
};

const PurchaseDomainPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maxResults, setMaxResults] = useState<string>('50');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [domainPricing, setDomainPricing] = useState<Record<string, DomainPricing>>({});
  const [loadingPricing, setLoadingPricing] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a domain keyword to search');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);
    setSelectedDomains(new Set());
    setDomainPricing({});

    try {
      const additionalParams: Record<string, string> = {};
      if (maxResults) {
        additionalParams.MaxResults = maxResults;
      }
      
      const result = await purchaseDomainApi.searchDomains(searchTerm.trim(), additionalParams);
      setSearchResults(result.data);
      if (result.count === 0) {
        setError('No domains found. Try a different keyword.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search domains. Please try again.');
      console.error('Error searching domains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainSelect = async (domain: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domain)) {
      newSelected.delete(domain);
      // Remove pricing when deselected
      const newPricing = { ...domainPricing };
      delete newPricing[domain];
      setDomainPricing(newPricing);
    } else {
      newSelected.add(domain);
      // Fetch pricing for selected domain using getDomainPricing API
      const parsed = parseDomain(domain);
      if (parsed) {
        setLoadingPricing(prev => new Set(prev).add(domain));
        try {
          const pricingResponse = await purchaseDomainApi.getDomainPricing(parsed.sld, parsed.tld, 1);
          setDomainPricing(prev => ({
            ...prev,
            [domain]: pricingResponse.data,
          }));
        } catch (err: any) {
          console.error('Error fetching pricing for domain:', domain, err);
          setError(`Failed to get pricing for ${domain}. Please try again.`);
        } finally {
          setLoadingPricing(prev => {
            const newSet = new Set(prev);
            newSet.delete(domain);
            return newSet;
          });
        }
      }
    }
    setSelectedDomains(newSelected);
  };

  const handleAddToCart = async () => {
    if (selectedDomains.size === 0) {
      setError('Please select at least one domain');
      return;
    }

    // Check if all selected domains have pricing
    const domainsWithoutPricing = Array.from(selectedDomains).filter(
      domain => !domainPricing[domain]
    );

    if (domainsWithoutPricing.length > 0) {
      setError('Please wait for pricing to load for all selected domains');
      return;
    }

    setAddingToCart(true);
    setError('');

    try {
      const domainsToAdd = Array.from(selectedDomains);
      const addPromises = domainsToAdd.map(async (domain) => {
        const parsed = parseDomain(domain);
        if (!parsed) {
          throw new Error(`Invalid domain format: ${domain}`);
        }

        // Get pricing data for this domain (same data displayed in the UI)
        const pricing = domainPricing[domain];
        if (!pricing) {
          throw new Error(`Pricing not available for ${domain}`);
        }

        // Use the pricing data that's displayed in the selected domains section
        // Calculate years from totalPrice and registrationPrice (since pricing is for 1 year by default)
        // If totalPrice equals registrationPrice, it's 1 year
        // Otherwise, calculate the number of years
        const years = pricing.registrationPrice > 0 
          ? Math.max(1, Math.round(pricing.totalPrice / pricing.registrationPrice))
          : 1;

        return domainCartApi.addToCart({
          domain,
          sld: parsed.sld,
          tld: parsed.tld,
          years: years, // Use calculated years from the displayed pricing data
          // Send pricing data that's displayed in the UI
          registrationPrice: pricing.registrationPrice,
          renewalPrice: pricing.renewalPrice,
          transferPrice: pricing.transferPrice,
          totalPrice: pricing.totalPrice,
        });
      });

      await Promise.all(addPromises);

      // Show success message
      setError('');
      
      // Clear selection after successful addition
      setSelectedDomains(new Set());
      setDomainPricing({});
      navigate('/app/purchase-domain/domain-cart')
      // Show success toast
      toast.success(
        `Successfully added ${domainsToAdd.length} domain${domainsToAdd.length > 1 ? 's' : ''} to cart!`,
        {
          description: 'You can view your cart to proceed with checkout.',
          action: {
            label: 'View Cart',
            onClick: () => navigate('/app/purchase-domain/domain-cart'),
          },
        }
      );
    } catch (err: any) {
      console.error('Error adding domains to cart:', err);
      setError(
        err.response?.data?.message || 
        `Failed to add domains to cart: ${err.message || 'Unknown error'}`
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const getAvailabilityBadge = (available: boolean, premium: boolean) => {
    if (premium) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Premium
        </Badge>
      );
    }
    if (available) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Available
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Taken
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/domains')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Domains
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app/purchase-domain/domain-cart')}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                View Cart
              </Button>
            </div>

            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Globe className="mr-3 h-8 w-8" /> Purchase Domain
            </h1>
            <p className="text-muted-foreground mb-6">
              Search for available domains and purchase them directly. Find the perfect domain name for your business.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter domain keyword (e.g., 'example', 'mydomain')"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !searchTerm.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Additional Options */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Max Results:</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={maxResults}
                    onChange={(e) => setMaxResults(e.target.value)}
                    className="w-20"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  NameSpinner will automatically suggest available domains
                </p>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Search Results ({searchResults.length} domains)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {searchResults.map((result, index) => {
                    const isSelected = selectedDomains.has(result.domain);
                    const isLoadingPrice = loadingPricing.has(result.domain);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => result.available && handleDomainSelect(result.domain)}
                        disabled={!result.available || isLoadingPrice}
                        className={`
                          inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all
                          ${isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : result.available
                            ? 'bg-background hover:bg-accent border-border hover:border-primary'
                            : 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60'
                          }
                          ${isLoadingPrice ? 'opacity-50 cursor-wait' : ''}
                        `}
                      >
                        {isSelected && <CheckCircle className="h-4 w-4" />}
                        <span className="font-medium">{result.domain}</span>
                        {getAvailabilityBadge(result.available, result.premium)}
                        {isLoadingPrice && <Loader2 className="h-3 w-3 animate-spin" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && searchResults.length === 0 && searchTerm && (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No results found. Try searching with a different keyword.</p>
              </div>
            )}

            {!searchTerm && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Enter a keyword above to search for available domains.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pricing Section at Bottom */}
        {selectedDomains.size > 0 && (
          <Card className="sticky bottom-0 z-10 border-t-2">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Selected Domains ({selectedDomains.size})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDomains(new Set());
                    setDomainPricing({});
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-3">
                {Array.from(selectedDomains).map((domain) => {
                  const pricing = domainPricing[domain];
                  const isLoading = loadingPricing.has(domain);
                  
                  return (
                    <div
                      key={domain}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{domain}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading price...
                          </div>
                        ) : pricing ? (
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              ${pricing.totalPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${pricing.registrationPrice.toFixed(2)}/year
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Price unavailable
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDomainSelect(domain)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {Object.keys(domainPricing).length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      $
                      {Object.values(domainPricing)
                        .reduce((sum, p) => sum + p.totalPrice, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || selectedDomains.size === 0}
                    className="w-full"
                    size="lg"
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add {selectedDomains.size} Domain{selectedDomains.size > 1 ? 's' : ''} to Cart
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PurchaseDomainPage;


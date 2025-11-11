import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/DashboardLayout';
import { purchaseDomainApi, DomainSearchResult } from '@/services/purchaseDomainApi';

const PurchaseDomainPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['com', 'net', 'org', 'io', 'co']);

  const popularTlds = ['com', 'net', 'org', 'io', 'co', 'app', 'dev', 'tech', 'online', 'store'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError('Please enter a domain keyword to search');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const result = await purchaseDomainApi.searchDomains(keyword.trim(), selectedTlds);
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

  const toggleTld = (tld: string) => {
    setSelectedTlds((prev) =>
      prev.includes(tld) ? prev.filter((t) => t !== tld) : [...prev, tld]
    );
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
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/domains')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Domains
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
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !keyword.trim()}>
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

              {/* TLD Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select TLDs to search:</label>
                <div className="flex flex-wrap gap-2">
                  {popularTlds.map((tld) => (
                    <Button
                      key={tld}
                      type="button"
                      variant={selectedTlds.includes(tld) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTld(tld)}
                      className="text-sm"
                    >
                      .{tld}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedTlds.length} TLD{selectedTlds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Search Results ({searchResults.length} domains)
                </h2>
                <div className="grid gap-4">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-lg">{result.domain}</h3>
                            <p className="text-sm text-muted-foreground">
                              {result.available
                                ? 'This domain is available for purchase'
                                : 'This domain is already taken'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getAvailabilityBadge(result.available, result.premium)}
                          {result.available && (
                            <Button
                              size="sm"
                              onClick={() => {
                                // TODO: Navigate to purchase/checkout page
                                console.log('Purchase domain:', result.domain);
                              }}
                            >
                              Purchase
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!loading && searchResults.length === 0 && keyword && (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No results found. Try searching with a different keyword.</p>
              </div>
            )}

            {!keyword && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Enter a keyword above to search for available domains.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseDomainPage;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Check, Search } from "lucide-react";
import api from "@/axiosInstance";
import { toast } from "sonner";

interface PreWarmedDomain {
  _id: string;
  domain: string;
  domainPrice: number;
  emailPrice: number;
  emails: Array<{
    email: string;
    persona: string;
    provider: string;
    price: number;
  }>;
}

export const PreWarmedDomainSelect: React.FC = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<PreWarmedDomain[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDomains();
  }, [searchQuery]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pre-warmed-domains", {
        params: searchQuery ? { search: searchQuery } : {},
      });
      if (response.data.success) {
        setDomains(response.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch domains");
    } finally {
      setLoading(false);
    }
  };

  const toggleDomainSelection = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  const handleContinue = () => {
    if (selectedDomains.length === 0) {
      toast.error("Please select at least one domain");
      return;
    }
    // Reserve domains and navigate to order page
    navigate("/app/dashboard/accounts/pre-warmed/order", {
      state: { selectedDomains },
    });
  };

  const selectedDomainsData = domains.filter((d) =>
    selectedDomains.includes(d.domain)
  );
  const totalDomainPrice = selectedDomainsData.reduce(
    (sum, d) => sum + d.domainPrice,
    0
  );

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      <AppHeader
        onClickAction={() => navigate(-1)}
        headings={"Back"}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Select Pre-warmed Domains</h1>
            <p className="text-muted-foreground mt-2">
              Choose from available pre-warmed domains to get started quickly
            </p>
          </div>

          {/* Search Bar */}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search from pre-warmed accounts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

          {/* Domains Grid */}
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <p className="text-muted-foreground">Loading domains...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Available Domains</CardTitle>
                <CardDescription>
                  Select one or more domains to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {domains.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No domains found</p>
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {domains.map((domain) => {
                      const isSelected = selectedDomains.includes(domain.domain);
                      return (
                        <button
                          key={domain._id}
                          onClick={() => toggleDomainSelection(domain.domain)}
                          className={`group relative flex items-center justify-between rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50 bg-card"
                          }`}
                        >
                          <span className="text-sm font-medium">{domain.domain}</span>
                          {isSelected &&
                            <div className="absolute -right-2 -top-0 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3 w-3" />
                            </div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Selected Domains Summary */}
          {selectedDomains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Domains</CardTitle>
                <CardDescription>
                  Review your selection before proceeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {selectedDomainsData.map((domain) => (
                    <div
                      key={domain._id}
                      className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                    >
                      <span className="text-sm font-medium">{domain.domain}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-semibold">
                          ${domain.domainPrice}
                        </Badge>
                        <button
                          onClick={() => toggleDomainSelection(domain.domain)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {domains.length} pre-warmed domains remaining
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subtotal (Annual Domain Price)</span>
                    <span className="text-lg font-bold">${totalDomainPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={selectedDomains.length === 0}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


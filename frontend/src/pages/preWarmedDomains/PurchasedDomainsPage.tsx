import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Search, Mail, User, Calendar, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/DashboardLayout';
import { preWarmedDomainApi, type PreWarmedDomain } from '@/services/preWarmedDomainApi';

const PurchasedDomainsPage = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<PreWarmedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await preWarmedDomainApi.getAllDomains(searchQuery || undefined);
      setDomains(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch domains.');
      console.error('Error fetching domains:', err);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleDomainClick = (domainId: string) => {
    navigate(`/app/dashboard/purchased-domains/${domainId}`);
  };

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading)
    return (
      <DashboardLayout>
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Globe className="mr-3 h-6 w-6" /> Purchased Pre-Warmed Domains
            </h2>
            <div className="mb-4">
              <Skeleton className="h-10 w-full max-w-lg" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Emails</TableHead>
                  <TableHead>Forwarding</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Globe className="mr-3 h-6 w-6" /> All Pre-Warmed Domains
            </h2>
            <p className="text-muted-foreground mb-6">
              View all pre-warmed domains and their associated email accounts. Click on a domain to view details.
            </p>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search */}
            <div className="mb-6 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 flex gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>Total Domains: {domains.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Available: {domains.filter(d => d.status === 'available').length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Purchased: {domains.filter(d => d.status === 'purchased').length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Reserved: {domains.filter(d => d.status === 'reserved').length}</span>
              </div>
            </div>

            {domains.length === 0 && !loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>
                  {searchQuery
                    ? 'No domains found matching your search.'
                    : 'No domains found.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Emails</TableHead>
                    <TableHead>Forwarding</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow 
                      key={domain._id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleDomainClick(domain._id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{domain.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            domain.status === 'purchased' ? 'default' :
                            domain.status === 'reserved' ? 'secondary' :
                            'outline'
                          }
                        >
                          {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                        </Badge>
                        {domain.warmingup && (
                          <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                            Warming Up
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {domain.userId ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">
                                {domain.userId.full_name || domain.userId.username || domain.userId.email || 'Unknown'}
                              </div>
                              {domain.userId.email && (
                                <div className="text-xs text-muted-foreground">
                                  {domain.userId.email}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No owner</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {domain.emails?.length || 0} email{domain.emails?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {domain.emails && domain.emails.length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {domain.emails.slice(0, 2).map((email) => email.email).join(', ')}
                            {domain.emails.length > 2 && ` +${domain.emails.length - 2} more`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {domain.forwarding ? (
                          <span className="text-sm font-mono">{domain.forwarding}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(domain.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PurchasedDomainsPage;


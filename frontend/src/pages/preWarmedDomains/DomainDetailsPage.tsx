import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Mail, 
  User, 
  Calendar, 
  ArrowLeft, 
  Flame,
  CheckCircle,
  XCircle,
  Building2,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/DashboardLayout';
import { preWarmedDomainApi, type PreWarmedDomain } from '@/services/preWarmedDomainApi';
import { toast } from 'sonner';

const DomainDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [domain, setDomain] = useState<PreWarmedDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingWarmup, setTogglingWarmup] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDomain();
    }
  }, [id]);

  const fetchDomain = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await preWarmedDomainApi.getDomainById(id);
      setDomain(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch domain details.');
      console.error('Error fetching domain:', err);
      toast.error('Failed to fetch domain details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWarmup = async (checked: boolean) => {
    if (!id || !domain) return;

    try {
      setTogglingWarmup(true);
      const updatedDomain = await preWarmedDomainApi.toggleDomainWarmup(id, checked);
      setDomain(updatedDomain);
      toast.success(`Warmup ${checked ? 'enabled' : 'disabled'} successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle warmup');
      console.error('Error toggling warmup:', err);
    } finally {
      setTogglingWarmup(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Card>
          <div className="p-6">
            <div className="mb-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  if (error || !domain) {
    return (
      <DashboardLayout>
        <Card>
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/app/dashboard/purchased-domains')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Domains
            </Button>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Domain not found'}
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/app/dashboard/purchased-domains')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Domains
            </Button>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Globe className="h-8 w-8" />
                  {domain.domain}
                </h1>
                <div className="flex items-center gap-2 mb-4">
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
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <Flame className="mr-1 h-3 w-3" />
                      Warming Up
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Domain Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Emails</div>
                  <div className="text-lg font-semibold">{domain.emails?.length || 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Owner</div>
                  <div className="text-lg font-semibold">
                    {domain.userId 
                      ? (domain.userId.full_name || domain.userId.username || domain.userId.email || 'Unknown')
                      : 'No owner'
                    }
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Domain Price</div>
                  <div className="text-lg font-semibold">${domain.domainPrice}/yr</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-lg font-semibold">
                    {new Date(domain.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Forwarding */}
            {domain.forwarding && (
              <div className="mb-6 p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Email Forwarding</span>
                </div>
                <span className="text-sm font-mono">{domain.forwarding}</span>
              </div>
            )}

            {/* Warmup Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex-1">
                <Label htmlFor="warmup-toggle" className="text-base font-semibold flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Enable Email Warmup
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Enable warmup for all emails in this domain to improve deliverability and sender reputation.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {domain.warmingup ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
                <Switch
                  id="warmup-toggle"
                  checked={domain.warmingup || false}
                  onCheckedChange={handleToggleWarmup}
                  disabled={togglingWarmup}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Emails Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Mail className="mr-3 h-6 w-6" />
              Email Accounts ({domain.emails?.length || 0})
            </h2>

            {!domain.emails || domain.emails.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No email accounts found for this domain.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Persona</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domain.emails.map((email, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{email.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{email.persona}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            email.provider === 'gmail' ? 'default' :
                            email.provider === 'outlook' ? 'secondary' :
                            'outline'
                          }
                        >
                          {email.provider.charAt(0).toUpperCase() + email.provider.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">${email.price}/mo</span>
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

export default DomainDetailsPage;


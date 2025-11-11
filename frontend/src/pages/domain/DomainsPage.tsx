import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DomainResponse, VerifyDomainResponse } from '@/services/domainApi';
import { Globe, Clipboard, CheckCircle, Clock, Trash2, AlertCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { domainApi } from '@/services/domainApi';
import { DashboardLayout } from '@/components/DashboardLayout';

const DomainsPage = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<DomainResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [dkimSelector, setDkimSelector] = useState('email');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRecordsModalOpen, setRecordsModalOpen] = useState(false);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainResponse | null>(null);
  const [verificationResults, setVerificationResults] = useState<VerifyDomainResponse | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      const data = await domainApi.getDomains();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setDomains(data);
        setError('');
      } else {
        console.error('Invalid response format:', data);
        setError('Invalid response format from server.');
        setDomains([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch domains.');
      console.error('Error fetching domains:', err);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    
    setIsAdding(true);
    setError('');
    setSuccess('');
    
    try {
      const createdDomain = await domainApi.createDomain(newDomain.trim(), dkimSelector.trim() || 'email');
      setNewDomain('');
      setDkimSelector('email');
      setSuccess(`Domain ${createdDomain.domain_name} added successfully! DNS records are ready to configure.`);
      await fetchDomains();
      
      // Auto-open records modal for the newly created domain
      setSelectedDomain(createdDomain);
      setRecordsModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add domain.');
      console.error('Error adding domain:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    setError('');
    setSuccess('');
    
    try {
      const result = await domainApi.verifyDomain(domainId);
      setVerificationResults(result);
      setSelectedDomain(result.domain);
      setVerificationModalOpen(true);
      await fetchDomains();
      
      if (result.verified) {
        setSuccess('All DNS records verified successfully!');
      } else {
        setError('Some DNS records failed verification. Please check the details.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify domain.');
      console.error('Error verifying domain:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!window.confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      return;
    }

    setDeletingId(domainId);
    setError('');
    setSuccess('');
    
    try {
      await domainApi.deleteDomain(domainId);
      setSuccess('Domain deleted successfully.');
      await fetchDomains();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete domain.');
      console.error('Error deleting domain:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const showRecords = (domain: DomainResponse) => {
    setSelectedDomain(domain);
    setRecordsModalOpen(true);
  };

  const DnsRecordRow = ({ type, host, value, instructions }: { type: string; host: string; value: string; instructions?: string }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-3 gap-2 text-sm items-center">
          <div className="font-mono text-muted-foreground">{type}</div>
          <div className="font-mono col-span-2 flex justify-between items-center bg-muted p-2 rounded border">
            <span className="truncate">{host}</span>
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(host)} 
              title="Copy host"
            >
              {copied ? <CheckCircle size={16} className="text-primary" /> : <Clipboard size={16} />}
            </Button>
          </div>
        </div>
        <div className="font-mono text-sm break-all bg-muted p-2 rounded border flex justify-between items-start gap-2">
          <span className="flex-1">{value}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(value)}
            title="Copy value"
          >
            {copied ? <CheckCircle size={16} className="text-primary" /> : <Clipboard size={16} />}
          </Button>
        </div>
        {instructions && (
          <p className="text-xs text-muted-foreground italic">{instructions}</p>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <DashboardLayout>
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Globe className="mr-3 h-6 w-6" /> Sending Domains
            </h2>
            <div className="mb-4">
              <Skeleton className="h-10 w-full max-w-lg" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-20 rounded-md" /><Skeleton className="h-8 w-20 rounded-md" /></div></TableCell>
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
            <Globe className="mr-3 h-6 w-6" /> Sending Domains
          </h2>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Verify your domains to start sending emails. Add the provided DNS records to your domain's
              registrar. It may take some time for DNS changes to propagate.
            </p>
            <Button
              onClick={() => navigate('/app/purchase-domain')}
              className="ml-4"
            >
              Buy Domain
            </Button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Alert variant="success" className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Add domain form */}
          <form onSubmit={handleAddDomain} className="mb-6 space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                required
                className="grow"
                disabled={isAdding}
              />
              <Input
                type="text"
                placeholder="DKIM Selector (default: email)"
                value={dkimSelector}
                onChange={(e) => setDkimSelector(e.target.value)}
                className="w-48"
                disabled={isAdding}
              />
              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The DKIM selector is used to identify your DKIM key. Default is "email".
            </p>
          </form>

          {domains.length === 0 && !loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No domains added yet. Add your first domain to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell>
                      <span className="font-medium">{d.domain_name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          d.status === 'verified'
                            ? 'default'
                            : d.status === 'pending'
                            ? 'secondary'
                            : d.status === 'failed'
                            ? 'destructive'
                            : 'outline'
                        }
                        className="inline-flex items-center gap-1.5"
                      >
                        {d.status === 'verified' && <CheckCircle className="h-3 w-3" />}
                        {d.status === 'pending' && <Clock className="h-3 w-3" />}
                        {d.status === 'failed' && <XCircle className="h-3 w-3" />}
                        <span className="capitalize">{d.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {d.last_verified_at 
                          ? new Date(d.last_verified_at).toLocaleString() 
                          : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => showRecords(d)}>
                          View Records
                        </Button>
                        {d.status !== 'verified' && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyDomain(d._id)}
                            disabled={verifyingId === d._id}
                          >
                            {verifyingId === d._id ? 'Verifying...' : 'Verify'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDomain(d._id)}
                          disabled={deletingId === d._id}
                          title="Delete domain"
                        >
                          {deletingId === d._id ? (
                            'Deleting...'
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* DNS Records Modal */}
      <Dialog
        open={isRecordsModalOpen && selectedDomain !== null}
        onOpenChange={() => {
          setRecordsModalOpen(false);
          setSelectedDomain(null);
        }}
      >
         {selectedDomain && (
          <DialogContent className="max-h-[80vh] py-10 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>DNS Records for {selectedDomain.domain_name}</DialogTitle>
              <DialogDescription>
                Add these DNS records to your domain's DNS settings. It may take some time for them to
                propagate (usually 5-30 minutes, but can take up to 48 hours).
              </DialogDescription>
            </DialogHeader>
          <div className="space-y-6 overflow-y-auto">

            {selectedDomain.dnsRecords ? (
              <>
                <div>
                  <h4 className="font-semibold text-lg pt-2 mb-3">SPF Record</h4>
                  <DnsRecordRow
                    type="TXT"
                    host={selectedDomain.dnsRecords.spf.host}
                    value={selectedDomain.dnsRecords.spf.value}
                    instructions={selectedDomain.dnsRecords.spf.instructions}
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-lg pt-2 mb-3">DKIM Record</h4>
                  <DnsRecordRow
                    type="TXT"
                    host={selectedDomain.dnsRecords.dkim.host}
                    value={selectedDomain.dnsRecords.dkim.value}
                    instructions={selectedDomain.dnsRecords.dkim.instructions}
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-lg pt-2 mb-3">DMARC Record</h4>
                  <DnsRecordRow
                    type="TXT"
                    host={selectedDomain.dnsRecords.dmarc.host}
                    value={selectedDomain.dnsRecords.dmarc.value}
                    instructions={selectedDomain.dnsRecords.dmarc.instructions}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {selectedDomain.spf_record && (
                  <div>
                    <h4 className="font-semibold text-lg pt-2 mb-3">SPF Record</h4>
                    <DnsRecordRow
                      type="TXT"
                      host={selectedDomain.domain_name}
                      value={selectedDomain.spf_record}
                      instructions="Add this TXT record at the root (@) of your domain"
                    />
                  </div>
                )}
                {selectedDomain.dkim_public_key && (
                  <div>
                    <h4 className="font-semibold text-lg pt-2 mb-3">DKIM Record</h4>
                    <DnsRecordRow
                      type="TXT"
                      host={`${selectedDomain.dkim_selector}._domainkey.${selectedDomain.domain_name}`}
                      value={selectedDomain.dkim_public_key}
                      instructions={`Add this TXT record at ${selectedDomain.dkim_selector}._domainkey.${selectedDomain.domain_name}`}
                    />
                  </div>
                )}
                {selectedDomain.dmarc_record && (
                  <div>
                    <h4 className="font-semibold text-lg pt-2 mb-3">DMARC Record</h4>
                    <DnsRecordRow
                      type="TXT"
                      host={`_dmarc.${selectedDomain.domain_name}`}
                      value={selectedDomain.dmarc_record}
                      instructions={`Add this TXT record at _dmarc.${selectedDomain.domain_name}`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setRecordsModalOpen(false);
              setSelectedDomain(null);
            }}>
              Close
            </Button>
          </DialogFooter>
          </DialogContent>
         )}
      </Dialog>

      {/* Verification Results Modal */}
      <Dialog
        open={isVerificationModalOpen && verificationResults !== null}
        onOpenChange={() => {
          setVerificationModalOpen(false);
          setVerificationResults(null);
        }}
      >
          <DialogContent className="max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Verification Results for {selectedDomain?.domain_name || ''}</DialogTitle>
            </DialogHeader>
          <div className="space-y-4 overflow-y-auto">
            <Alert variant={verificationResults?.verified ? 'default' : 'destructive'}>
              {verificationResults?.verified ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <AlertDescription className="font-semibold">
                {verificationResults?.verified
                  ? 'All DNS records verified successfully!'
                  : 'Some DNS records failed verification'}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="p-3 bg-muted rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">DKIM</span>
                  {verificationResults?.verificationResults?.dkim?.verified ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {verificationResults?.verificationResults?.dkim?.message}
                </p>
                {verificationResults?.verificationResults?.dkim?.recordValue && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                    Found: {verificationResults?.verificationResults?.dkim?.recordValue}
                  </p>
                )}
              </div>

              <div className="p-3 bg-muted rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">SPF</span>
                  {verificationResults?.verificationResults?.spf?.verified ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {verificationResults?.verificationResults?.spf?.message}
                </p>
                {verificationResults?.verificationResults?.spf?.recordValue && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                    Found: {verificationResults?.verificationResults?.spf?.recordValue}
                  </p>
                )}
              </div>

              <div className="p-3 bg-muted rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">DMARC</span>
                  {verificationResults?.verificationResults?.dmarc?.verified ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {verificationResults?.verificationResults?.dmarc?.message}
                </p>
                {verificationResults?.verificationResults?.dmarc?.recordValue && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                    Found: {verificationResults?.verificationResults?.dmarc?.recordValue}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setVerificationModalOpen(false);
              setVerificationResults(null);
            }}>
              Close
            </Button>
          </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  );
};

export default DomainsPage;

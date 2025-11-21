import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { DomainResponse, VerifyDomainResponse, IPreWarmedEmail } from "@/services/domainApi";
import { purchaseDomainApi, type PurchasedDomain } from "@/services/purchaseDomainApi";
import {
  Globe,
  Clipboard,
  CheckCircle,
  Clock,
  Trash2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { domainApi } from "@/services/domainApi";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import api from "@/axiosInstance";
import { toast } from "sonner";

const DomainsPage = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<DomainResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [dkimSelector, setDkimSelector] = useState("email");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [emailName, setEmailName] = useState("");
  const [persona, setPersona] = useState("");
  const [success, setSuccess] = useState("");
  const [isEmailCreate, setIsEmailCreate] = useState(false);
  const [isViewEmailsOpen, setIsViewEmailsOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRecordsModalOpen, setRecordsModalOpen] = useState(false);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainResponse | null>(null);
  const [verificationResults, setVerificationResults] = useState<VerifyDomainResponse | null>(null);
  const [purchasedDomains, setPurchasedDomains] = useState<PurchasedDomain[]>([]);
  const [loadingPurchased, setLoadingPurchased] = useState(true);
  const [checkingPurchaseId, setCheckingPurchaseId] = useState<string | null>(null);
  const [settingDnsId, setSettingDnsId] = useState<string | null>(null);
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDomainForDetail, setSelectedDomainForDetail] = useState<
    DomainResponse | PurchasedDomain | null
  >(null);
  const [selectedDomainType, setSelectedDomainType] = useState<"verified" | "purchased" | null>(
    null
  );

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      const data = await domainApi.getDomains();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setDomains(data);
        setError("");
      } else {
        console.error("Invalid response format:", data);
        setError("Invalid response format from server.");
        setDomains([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch domains.");
      console.error("Error fetching domains:", err);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPurchasedDomains = useCallback(async () => {
    try {
      setLoadingPurchased(true);
      const data = await purchaseDomainApi.getMyPurchasedDomains();
      setPurchasedDomains(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch purchased domains.");
      setPurchasedDomains([]);
    } finally {
      setLoadingPurchased(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  useEffect(() => {
    fetchPurchasedDomains();
  }, [fetchPurchasedDomains]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsAdding(true);
    setError("");
    setSuccess("");

    try {
      const createdDomain = await domainApi.createDomain(
        newDomain.trim(),
        dkimSelector.trim() || "email"
      );
      setNewDomain("");
      setDkimSelector("email");
      setSuccess(
        `Domain ${createdDomain.domain_name} added successfully! DNS records are ready to configure.`
      );
      await fetchDomains();

      // Auto-open records modal for the newly created domain
      setSelectedDomain(createdDomain);
      setRecordsModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add domain.");
      console.error("Error adding domain:", err);
    } finally {
      setIsAdding(false);
    }
  };
  const handleViewEmails = (domain: DomainResponse) => {
    setSelectedDomain(domain);
    setIsViewEmailsOpen(true);
  };
  const handleEmailCreate = (domain: DomainResponse) => {
    setIsEmailCreate(true);
    setSelectedDomain(domain);
  };
  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    setError("");
    setSuccess("");

    try {
      const result = await domainApi.verifyDomain(domainId);
      setVerificationResults(result);
      setSelectedDomain(result.domain);
      setVerificationModalOpen(true);
      await fetchDomains();

      if (result.verified) {
        setSuccess("All DNS records verified successfully!");
      } else {
        setError("Some DNS records failed verification. Please check the details.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify domain.");
      console.error("Error verifying domain:", err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this domain? This action cannot be undone.")
    ) {
      return;
    }

    setDeletingId(domainId);
    setError("");
    setSuccess("");

    try {
      await domainApi.deleteDomain(domainId);
      setSuccess("Domain deleted successfully.");
      await fetchDomains();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete domain.");
      console.error("Error deleting domain:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await api.post(`/domains/${selectedDomain?._id}/add-email`, {
        email: `${emailName}@${selectedDomain.domain_name}`,
        persona: persona,
      });
      if (res.data && res.status === 200) {
        toast.success("Email created successfully!");
        setIsEmailCreate(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPurchaseStatus = async (domainId: string) => {
    setCheckingPurchaseId(domainId);
    setError("");
    setSuccess("");

    try {
      const statusResponse = await purchaseDomainApi.checkPurchasedDomainStatus(domainId);
      const updatedDomain = statusResponse.data.domain;
      const registrationStatus = statusResponse.data.registrationStatus;

      setPurchasedDomains((prev) =>
        prev.map((domain) => (domain._id === updatedDomain._id ? updatedDomain : domain))
      );

      if (registrationStatus?.registered) {
        setSuccess(`Domain ${updatedDomain.domain} is now active.`);
      } else {
        const statusText = registrationStatus?.status ? ` (${registrationStatus.status})` : "";
        setError(`Domain ${updatedDomain.domain} is still pending registration${statusText}.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check domain registration status.");
      console.error("Error checking purchased domain status:", err);
    } finally {
      setCheckingPurchaseId(null);
    }
  };

  const handleSetDNS = async (domainId: string) => {
    setSettingDnsId(domainId);
    setError("");
    setSuccess("");

    try {
      const response = await purchaseDomainApi.setPurchasedDomainDNS(domainId);
      setSuccess(response.message || `DNS records set successfully for ${response.data.domain}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.response?.data?.error || "Failed to set DNS records."
      );
      console.error("Error setting DNS records:", err);
    } finally {
      setSettingDnsId(null);
    }
  };

  const showRecords = (domain: DomainResponse) => {
    setSelectedDomain(domain);
    setRecordsModalOpen(true);
  };

  const showDomainDetail = (
    domain: DomainResponse | PurchasedDomain,
    type: "verified" | "purchased"
  ) => {
    setSelectedDomainForDetail(domain);
    setSelectedDomainType(type);
    setDetailDialogOpen(true);
  };

  const DnsRecordRow = ({
    type,
    host,
    value,
    instructions,
  }: {
    type: string;
    host: string;
    value: string;
    instructions?: string;
  }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="mb-4 space-y-2">
        <div className="grid grid-cols-3 items-center gap-2 text-sm">
          <div className="font-mono text-muted-foreground">{type}</div>
          <div className="col-span-2 flex items-center justify-between rounded border bg-muted p-2 font-mono">
            <span className="truncate">{host}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(host)}
              title="Copy host"
            >
              {copied ? (
                <CheckCircle size={16} className="text-primary" />
              ) : (
                <Clipboard size={16} />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2 break-all rounded border bg-muted p-2 font-mono text-sm">
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
        {instructions && <p className="text-xs italic text-muted-foreground">{instructions}</p>}
      </div>
    );
  };

  if (loading)
    return (
      <DashboardLayout>
        <Card>
          <div className="p-6">
            <h2 className="mb-4 flex items-center text-2xl font-semibold">
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
                  <TableHead>Email Account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
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
            <h2 className="mb-4 flex items-center text-2xl font-semibold">
              <Globe className="mr-3 h-6 w-6" /> Sending Domains
            </h2>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Verify your domains to start sending emails. Add the provided DNS records to your
                domain's registrar. It may take some time for DNS changes to propagate.
              </p>
              <Button onClick={() => navigate("/dashboard/purchase-domain")} className="ml-4">
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
            <form onSubmit={handleAddDomain} className="mb-6 max-w-2xl space-y-3">
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
                  {isAdding ? "Adding..." : "Add Domain"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The DKIM selector is used to identify your DKIM key. Default is "email".
              </p>
            </form>

            {domains.length === 0 && !loading ? (
              <div className="py-12 text-center text-muted-foreground">
                <Globe className="mx-auto mb-4 h-12 w-12 opacity-50" />
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
                    <TableHead>Email Account</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((d) => (
                    <TableRow
                      key={d._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => showDomainDetail(d, "verified")}
                    >
                      <TableCell>
                        <span className="font-medium">{d.domain_name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.status === "verified"
                              ? "default"
                              : d.status === "pending"
                                ? "secondary"
                                : d.status === "failed"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="inline-flex items-center gap-1.5"
                        >
                          {d.status === "verified" && <CheckCircle className="h-3 w-3" />}
                          {d.status === "pending" && <Clock className="h-3 w-3" />}
                          {d.status === "failed" && <XCircle className="h-3 w-3" />}
                          <span className="capitalize">{d.verificationStatus}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {d.last_verified_at
                            ? new Date(d.last_verified_at).toLocaleString()
                            : "Never"}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => showRecords(d)}>
                            View Records
                          </Button>
                          {d.status !== "verified" && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyDomain(d._id)}
                              disabled={verifyingId === d._id}
                            >
                              {verifyingId === d._id ? "Verifying..." : "Verify"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDomain(d._id)}
                            disabled={deletingId === d._id}
                            title="Delete domain"
                          >
                            {deletingId === d._id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {/* See Emails Button */}
                          <Button variant="outline" size="sm" onClick={() => handleViewEmails(d)}>
                            See Emails
                          </Button>

                          {/* Create Email Button */}
                          <Button size="sm" onClick={() => handleEmailCreate(d)}>
                            Create
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
            <DialogContent className="max-h-[80vh] overflow-y-auto py-10">
              <DialogHeader>
                <DialogTitle>DNS Records for {selectedDomain.domain_name}</DialogTitle>
                <DialogDescription>
                  Add these DNS records to your domain's DNS settings. It may take some time for
                  them to propagate (usually 5-30 minutes, but can take up to 48 hours).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 overflow-y-auto">
                {selectedDomain.dnsRecords ? (
                  <>
                    <div>
                      <h4 className="mb-3 pt-2 text-lg font-semibold">SPF Record</h4>
                      <DnsRecordRow
                        type="TXT"
                        host={selectedDomain.dnsRecords.spf.host}
                        value={selectedDomain.dnsRecords.spf.value}
                        instructions={selectedDomain.dnsRecords.spf.instructions}
                      />
                    </div>

                    <div>
                      <h4 className="mb-3 pt-2 text-lg font-semibold">DKIM Record</h4>
                      <DnsRecordRow
                        type="TXT"
                        host={selectedDomain.dnsRecords.dkim.host}
                        value={selectedDomain.dnsRecords.dkim.value}
                        instructions={selectedDomain.dnsRecords.dkim.instructions}
                      />
                    </div>

                    <div>
                      <h4 className="mb-3 pt-2 text-lg font-semibold">DMARC Record</h4>
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
                        <h4 className="mb-3 pt-2 text-lg font-semibold">SPF Record</h4>
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
                        <h4 className="mb-3 pt-2 text-lg font-semibold">DKIM Record</h4>
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
                        <h4 className="mb-3 pt-2 text-lg font-semibold">DMARC Record</h4>
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
                <Button
                  onClick={() => {
                    setRecordsModalOpen(false);
                    setSelectedDomain(null);
                  }}
                >
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
              <DialogTitle>
                Verification Results for {selectedDomain?.domain_name || ""}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto">
              <Alert variant={verificationResults?.verified ? "default" : "destructive"}>
                {verificationResults?.verified ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <AlertDescription className="font-semibold">
                  {verificationResults?.verified
                    ? "All DNS records verified successfully!"
                    : "Some DNS records failed verification"}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="rounded border bg-muted p-3">
                  <div className="mb-2 flex items-center justify-between">
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
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      Found: {verificationResults?.verificationResults?.dkim?.recordValue}
                    </p>
                  )}
                </div>

                <div className="rounded border bg-muted p-3">
                  <div className="mb-2 flex items-center justify-between">
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
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      Found: {verificationResults?.verificationResults?.spf?.recordValue}
                    </p>
                  )}
                </div>

                <div className="rounded border bg-muted p-3">
                  <div className="mb-2 flex items-center justify-between">
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
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      Found: {verificationResults?.verificationResults?.dmarc?.recordValue}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  setVerificationModalOpen(false);
                  setVerificationResults(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Purchased Domains Section */}
        <Card>
          <div className="p-6">
            <h2 className="mb-4 flex items-center text-2xl font-semibold">
              <Globe className="mr-3 h-6 w-6" /> Purchased Domains
            </h2>
            <p className="mb-6 text-muted-foreground">
              Domains you've purchased through our platform. Check the status to verify
              registration.
            </p>

            {loadingPurchased ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded border p-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            ) : purchasedDomains.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Globe className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No purchased domains yet. Purchase a domain to get started.</p>
                <Button onClick={() => navigate("/dashboard/purchase-domain")} className="mt-4">
                  Purchase Domain
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Purchase Status</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasedDomains.map((domain) => (
                    <TableRow
                      key={domain._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => showDomainDetail(domain, "purchased")}
                    >
                      <TableCell>
                        <span className="font-medium">{domain.domain}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            domain.purchaseStatus === "active"
                              ? "default"
                              : domain.purchaseStatus === "pending"
                                ? "secondary"
                                : domain.purchaseStatus === "failed"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="inline-flex items-center gap-1.5"
                        >
                          {domain.purchaseStatus === "active" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {domain.purchaseStatus === "pending" && <Clock className="h-3 w-3" />}
                          {domain.purchaseStatus === "failed" && <XCircle className="h-3 w-3" />}
                          <span className="capitalize">{domain.purchaseStatus}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-muted-foreground">
                          {domain.orderId || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {domain.purchaseDate
                            ? new Date(domain.purchaseDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {domain.expirationDate
                            ? new Date(domain.expirationDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {domain.purchaseStatus === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckPurchaseStatus(domain._id)}
                              disabled={checkingPurchaseId === domain._id}
                            >
                              {checkingPurchaseId === domain._id ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Check Status
                                </>
                              )}
                            </Button>
                          )}
                          {domain.purchaseStatus === "active" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetDNS(domain._id)}
                                disabled={settingDnsId === domain._id}
                              >
                                {settingDnsId === domain._id ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Setting DNS...
                                  </>
                                ) : (
                                  "Set DNS"
                                )}
                              </Button>
                              <Badge variant="default" className="inline-flex items-center gap-1.5">
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Domain Detail Dialog */}
        <Dialog
          open={isDetailDialogOpen && selectedDomainForDetail !== null}
          onOpenChange={(open) => {
            setDetailDialogOpen(open);
            if (!open) {
              setSelectedDomainForDetail(null);
              setSelectedDomainType(null);
            }
          }}
        >
          {selectedDomainForDetail && selectedDomainType && (
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedDomainType === "verified"
                    ? (selectedDomainForDetail as DomainResponse).domain_name
                    : (selectedDomainForDetail as PurchasedDomain).domain}
                </DialogTitle>
                <DialogDescription>
                  {selectedDomainType === "verified"
                    ? "Domain details and DNS configuration"
                    : "Purchased domain information and settings"}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList
                  className={`grid w-full ${selectedDomainType === "purchased" ? "grid-cols-4" : "grid-cols-3"}`}
                >
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="dns">DNS Records</TabsTrigger>
                  {selectedDomainType === "purchased" && (
                    <TabsTrigger value="registrant">Registrant</TabsTrigger>
                  )}
                  {selectedDomainType === "purchased" ? (
                    <TabsTrigger value="registration">Registration Info</TabsTrigger>
                  ) : (
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  )}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                  {selectedDomainType === "verified" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Domain Name
                          </label>
                          <p className="text-sm font-medium">
                            {(selectedDomainForDetail as DomainResponse).domain_name}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Status
                          </label>
                          <div>
                            <Badge
                              variant={
                                (selectedDomainForDetail as DomainResponse).status === "verified"
                                  ? "default"
                                  : (selectedDomainForDetail as DomainResponse).status === "pending"
                                    ? "secondary"
                                    : (selectedDomainForDetail as DomainResponse).status ===
                                        "failed"
                                      ? "destructive"
                                      : "outline"
                              }
                              className="inline-flex items-center gap-1.5"
                            >
                              {(selectedDomainForDetail as DomainResponse).status ===
                                "verified" && <CheckCircle className="h-3 w-3" />}
                              {(selectedDomainForDetail as DomainResponse).status === "pending" && (
                                <Clock className="h-3 w-3" />
                              )}
                              {(selectedDomainForDetail as DomainResponse).status === "failed" && (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span className="capitalize">
                                {(selectedDomainForDetail as DomainResponse).verificationStatus}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            DKIM Selector
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as DomainResponse).dkim_selector || "email"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Last Verified
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as DomainResponse).last_verified_at
                              ? new Date(
                                  (selectedDomainForDetail as DomainResponse).last_verified_at!
                                ).toLocaleString()
                              : "Never"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Created At
                          </label>
                          <p className="text-sm">
                            {new Date(
                              (selectedDomainForDetail as DomainResponse).createdAt
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Updated At
                          </label>
                          <p className="text-sm">
                            {new Date(
                              (selectedDomainForDetail as DomainResponse).updatedAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Domain Name
                          </label>
                          <p className="text-sm font-medium">
                            {(selectedDomainForDetail as PurchasedDomain).domain}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Purchase Status
                          </label>
                          <div>
                            <Badge
                              variant={
                                (selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                                "active"
                                  ? "default"
                                  : (selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                                      "pending"
                                    ? "secondary"
                                    : (selectedDomainForDetail as PurchasedDomain)
                                          .purchaseStatus === "failed"
                                      ? "destructive"
                                      : "outline"
                              }
                              className="inline-flex items-center gap-1.5"
                            >
                              {(selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                                "active" && <CheckCircle className="h-3 w-3" />}
                              {(selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                                "pending" && <Clock className="h-3 w-3" />}
                              {(selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                                "failed" && <XCircle className="h-3 w-3" />}
                              <span className="capitalize">
                                {(selectedDomainForDetail as PurchasedDomain).purchaseStatus}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Order ID
                          </label>
                          <p className="font-mono text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).orderId || "-"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Registration Period
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).years || 1} year(s)
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Purchase Date
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).purchaseDate
                              ? new Date(
                                  (selectedDomainForDetail as PurchasedDomain).purchaseDate!
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Expiration Date
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).expirationDate
                              ? new Date(
                                  (selectedDomainForDetail as PurchasedDomain).expirationDate!
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Price</label>
                          <p className="text-sm">
                            ${(selectedDomainForDetail as PurchasedDomain).price?.toFixed(2) || "-"}
                          </p>
                        </div>
                        {(selectedDomainForDetail as PurchasedDomain).verificationStatus && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Verification Status
                            </label>
                            <Badge variant="outline" className="capitalize">
                              {(selectedDomainForDetail as PurchasedDomain).verificationStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* DNS Records Tab */}
                <TabsContent value="dns" className="mt-4 space-y-4">
                  {selectedDomainType === "verified" ? (
                    <>
                      {(selectedDomainForDetail as DomainResponse).dnsRecords ? (
                        <>
                          <div>
                            <h4 className="mb-3 text-lg font-semibold">SPF Record</h4>
                            <DnsRecordRow
                              type="TXT"
                              host={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.spf.host
                              }
                              value={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.spf.value
                              }
                              instructions={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.spf
                                  .instructions
                              }
                            />
                          </div>
                          <div>
                            <h4 className="mb-3 text-lg font-semibold">DKIM Record</h4>
                            <DnsRecordRow
                              type="TXT"
                              host={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.dkim.host
                              }
                              value={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.dkim.value
                              }
                              instructions={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.dkim
                                  .instructions
                              }
                            />
                          </div>
                          <div>
                            <h4 className="mb-3 text-lg font-semibold">DMARC Record</h4>
                            <DnsRecordRow
                              type="TXT"
                              host={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.dmarc.host
                              }
                              value={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.dmarc.value
                              }
                              instructions={
                                (selectedDomainForDetail as DomainResponse).dnsRecords!.dmarc
                                  .instructions
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {(selectedDomainForDetail as DomainResponse).spf_record && (
                            <div>
                              <h4 className="mb-3 text-lg font-semibold">SPF Record</h4>
                              <DnsRecordRow
                                type="TXT"
                                host={(selectedDomainForDetail as DomainResponse).domain_name}
                                value={(selectedDomainForDetail as DomainResponse).spf_record}
                                instructions="Add this TXT record at the root (@) of your domain"
                              />
                            </div>
                          )}
                          {(selectedDomainForDetail as DomainResponse).dkim_public_key && (
                            <div>
                              <h4 className="mb-3 text-lg font-semibold">DKIM Record</h4>
                              <DnsRecordRow
                                type="TXT"
                                host={`${(selectedDomainForDetail as DomainResponse).dkim_selector}._domainkey.${(selectedDomainForDetail as DomainResponse).domain_name}`}
                                value={`v=DKIM1; k=rsa; p=${(selectedDomainForDetail as DomainResponse).dkim_public_key}`}
                                instructions={`Add this TXT record at ${(selectedDomainForDetail as DomainResponse).dkim_selector}._domainkey.${(selectedDomainForDetail as DomainResponse).domain_name}`}
                              />
                            </div>
                          )}
                          {(selectedDomainForDetail as DomainResponse).dmarc_record && (
                            <div>
                              <h4 className="mb-3 text-lg font-semibold">DMARC Record</h4>
                              <DnsRecordRow
                                type="TXT"
                                host={`_dmarc.${(selectedDomainForDetail as DomainResponse).domain_name}`}
                                value={(selectedDomainForDetail as DomainResponse).dmarc_record}
                                instructions={`Add this TXT record at _dmarc.${(selectedDomainForDetail as DomainResponse).domain_name}`}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {(selectedDomainForDetail as PurchasedDomain).spf_record && (
                        <div>
                          <h4 className="mb-3 text-lg font-semibold">SPF Record</h4>
                          <DnsRecordRow
                            type="TXT"
                            host={(selectedDomainForDetail as PurchasedDomain).domain}
                            value={(selectedDomainForDetail as PurchasedDomain).spf_record!}
                            instructions="Add this TXT record at the root (@) of your domain"
                          />
                        </div>
                      )}
                      {(selectedDomainForDetail as PurchasedDomain).dkim_public_key && (
                        <div>
                          <h4 className="mb-3 text-lg font-semibold">DKIM Record</h4>
                          <DnsRecordRow
                            type="TXT"
                            host={`${(selectedDomainForDetail as PurchasedDomain).dkim_selector || "email"}._domainkey.${(selectedDomainForDetail as PurchasedDomain).domain}`}
                            value={`v=DKIM1; k=rsa; p=${(selectedDomainForDetail as PurchasedDomain).dkim_public_key}`}
                            instructions={`Add this TXT record at ${(selectedDomainForDetail as PurchasedDomain).dkim_selector || "email"}._domainkey.${(selectedDomainForDetail as PurchasedDomain).domain}`}
                          />
                        </div>
                      )}
                      {(selectedDomainForDetail as PurchasedDomain).dmarc_record && (
                        <div>
                          <h4 className="mb-3 text-lg font-semibold">DMARC Record</h4>
                          <DnsRecordRow
                            type="TXT"
                            host={`_dmarc.${(selectedDomainForDetail as PurchasedDomain).domain}`}
                            value={(selectedDomainForDetail as PurchasedDomain).dmarc_record!}
                            instructions={`Add this TXT record at _dmarc.${(selectedDomainForDetail as PurchasedDomain).domain}`}
                          />
                        </div>
                      )}
                      {!(
                        (selectedDomainForDetail as PurchasedDomain).spf_record ||
                        (selectedDomainForDetail as PurchasedDomain).dkim_public_key ||
                        (selectedDomainForDetail as PurchasedDomain).dmarc_record
                      ) && (
                        <p className="py-8 text-center text-muted-foreground">
                          DNS records not yet configured for this domain.
                        </p>
                      )}
                    </>
                  )}
                </TabsContent>

                {/* Registrant Info Tab (Purchased domains only) */}
                {selectedDomainType === "purchased" && (
                  <TabsContent value="registrant" className="mt-4 space-y-4">
                    {(selectedDomainForDetail as PurchasedDomain).registrantInfo ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            First Name
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).registrantInfo!.firstName}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Last Name
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).registrantInfo!.lastName}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).registrantInfo!.email}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).registrantInfo!.phone}
                          </p>
                        </div>
                        {(selectedDomainForDetail as PurchasedDomain).registrantInfo!
                          .organizationName && (
                          <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Organization
                            </label>
                            <p className="text-sm">
                              {
                                (selectedDomainForDetail as PurchasedDomain).registrantInfo!
                                  .organizationName
                              }
                            </p>
                          </div>
                        )}
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Address
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).registrantInfo!.address1}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">City</label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).registrantInfo!.city}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            State/Province
                          </label>
                          <p className="text-sm">
                            {
                              (selectedDomainForDetail as PurchasedDomain).registrantInfo!
                                .stateProvince
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Postal Code
                          </label>
                          <p className="text-sm">
                            {
                              (selectedDomainForDetail as PurchasedDomain).registrantInfo!
                                .postalCode
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Country
                          </label>
                          <p className="text-sm">
                            {(selectedDomainForDetail as PurchasedDomain).registrantInfo!.country}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="py-8 text-center text-muted-foreground">
                        Registrant information not available.
                      </p>
                    )}
                  </TabsContent>
                )}

                {/* Registration Info Tab (Purchased domains only) */}
                {selectedDomainType === "purchased" && (
                  <TabsContent value="registration" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Order ID
                        </label>
                        <p className="font-mono text-sm">
                          {(selectedDomainForDetail as PurchasedDomain).orderId || "-"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Registration Period
                        </label>
                        <p className="text-sm">
                          {(selectedDomainForDetail as PurchasedDomain).years || 1} year(s)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Purchase Date
                        </label>
                        <p className="text-sm">
                          {(selectedDomainForDetail as PurchasedDomain).purchaseDate
                            ? new Date(
                                (selectedDomainForDetail as PurchasedDomain).purchaseDate!
                              ).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Expiration Date
                        </label>
                        <p className="text-sm">
                          {(selectedDomainForDetail as PurchasedDomain).expirationDate
                            ? new Date(
                                (selectedDomainForDetail as PurchasedDomain).expirationDate!
                              ).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Purchase Price
                        </label>
                        <p className="text-sm font-semibold">
                          ${(selectedDomainForDetail as PurchasedDomain).price?.toFixed(2) || "-"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Purchase Status
                        </label>
                        <div>
                          <Badge
                            variant={
                              (selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                              "active"
                                ? "default"
                                : (selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                                    "pending"
                                  ? "secondary"
                                  : (selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                                      "failed"
                                    ? "destructive"
                                    : "outline"
                            }
                            className="inline-flex items-center gap-1.5"
                          >
                            {(selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                              "active" && <CheckCircle className="h-3 w-3" />}
                            {(selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                              "pending" && <Clock className="h-3 w-3" />}
                            {(selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                              "failed" && <XCircle className="h-3 w-3" />}
                            <span className="capitalize">
                              {(selectedDomainForDetail as PurchasedDomain).purchaseStatus}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      {(selectedDomainForDetail as PurchasedDomain).verificationStatus && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            DNS Verification Status
                          </label>
                          <Badge variant="outline" className="capitalize">
                            {(selectedDomainForDetail as PurchasedDomain).verificationStatus}
                          </Badge>
                        </div>
                      )}
                      <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Domain Components
                        </label>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">SLD: </span>
                            <span className="font-mono">
                              {(selectedDomainForDetail as PurchasedDomain).sld}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">TLD: </span>
                            <span className="font-mono">
                              {(selectedDomainForDetail as PurchasedDomain).tld}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="mb-3 text-sm font-semibold">Quick Actions</h4>
                      {(selectedDomainForDetail as PurchasedDomain).purchaseStatus ===
                        "pending" && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            setDetailDialogOpen(false);
                            handleCheckPurchaseStatus(
                              (selectedDomainForDetail as PurchasedDomain)._id
                            );
                          }}
                          disabled={
                            checkingPurchaseId === (selectedDomainForDetail as PurchasedDomain)._id
                          }
                        >
                          {checkingPurchaseId ===
                          (selectedDomainForDetail as PurchasedDomain)._id ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Checking Status...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Check Registration Status
                            </>
                          )}
                        </Button>
                      )}
                      {(selectedDomainForDetail as PurchasedDomain).purchaseStatus === "active" && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            setDetailDialogOpen(false);
                            handleSetDNS((selectedDomainForDetail as PurchasedDomain)._id);
                          }}
                          disabled={
                            settingDnsId === (selectedDomainForDetail as PurchasedDomain)._id
                          }
                        >
                          {settingDnsId === (selectedDomainForDetail as PurchasedDomain)._id ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Setting DNS...
                            </>
                          ) : (
                            <>
                              <Globe className="mr-2 h-4 w-4" />
                              Set DNS Records
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Actions Tab (Verified domains only) */}
                {selectedDomainType === "verified" && (
                  <TabsContent value="actions" className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setDetailDialogOpen(false);
                          showRecords(selectedDomainForDetail as DomainResponse);
                        }}
                      >
                        <Clipboard className="mr-2 h-4 w-4" />
                        View DNS Records
                      </Button>
                      {(selectedDomainForDetail as DomainResponse).status !== "verified" && (
                        <Button
                          className="w-full justify-start"
                          onClick={() => {
                            setDetailDialogOpen(false);
                            handleVerifyDomain((selectedDomainForDetail as DomainResponse)._id);
                          }}
                          disabled={verifyingId === (selectedDomainForDetail as DomainResponse)._id}
                        >
                          {verifyingId === (selectedDomainForDetail as DomainResponse)._id ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verify Domain
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={() => {
                          setDetailDialogOpen(false);
                          handleDeleteDomain((selectedDomainForDetail as DomainResponse)._id);
                        }}
                        disabled={deletingId === (selectedDomainForDetail as DomainResponse)._id}
                      >
                        {deletingId === (selectedDomainForDetail as DomainResponse)._id ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Domain
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                )}
              </Tabs>

              <DialogFooter>
                <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        <Dialog
          open={isViewEmailsOpen && isViewEmailsOpen !== null}
          onOpenChange={()=>setIsViewEmailsOpen(false)}
        >
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Emails for {selectedDomain?.domain_name}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto pr-2">
              {selectedDomain?.emails?.length ? (
                selectedDomain.emails.map((emailObj: IPreWarmedEmail, index) => (
                  <div key={index} className="flex flex-col gap-1 rounded-xl border p-3 shadow-sm">
                    <span className="text-base font-medium">{emailObj.email}</span>
                    <span className="text-sm text-gray-600">Persona: {emailObj.persona}</span>
                    <span className="text-sm capitalize text-gray-600">
                      Status: {emailObj.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No emails found.</p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsViewEmailsOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isEmailCreate && isEmailCreate !== null} onOpenChange={setIsEmailCreate}>
          <DialogContent className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Create Email</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter email name"
                value={emailName}
                onChange={(e) => setEmailName(e.target.value)}
                className="flex-1"
              />
              <span className="text-gray-600">@{selectedDomain?.domain_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter email persona"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="flex-1"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !emailName || !persona}
              className="w-full rounded-2xl p-3"
            >
              {loading ? <Spinner className="h-5 w-5 animate-spin" /> : "Add Email"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DomainsPage;

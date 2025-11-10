/**
 * Base interface for DNS provider implementations
 * All DNS providers must implement these methods
 */
export interface IDNSProvider {
  /**
   * Add a TXT record to the domain
   * @param domain - The domain name (e.g., "example.com")
   * @param name - The record name (e.g., "email._domainkey")
   * @param value - The record value (e.g., "v=DKIM1; k=rsa; p=...")
   * @param credentials - Provider-specific credentials
   * @returns Promise resolving to success status and optional record ID
   */
  addTXTRecord(
    domain: string,
    name: string,
    value: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; recordId?: string; message?: string }>;

  /**
   * Verify a TXT record exists with the expected value
   * @param domain - The domain name
   * @param name - The record name to verify
   * @param expectedValue - The expected record value (or partial match)
   * @returns Promise resolving to verification result
   */
  verifyTXTRecord(
    domain: string,
    name: string,
    expectedValue?: string
  ): Promise<{ verified: boolean; recordValue?: string; message?: string }>;
}


import { detectProvider, DNSProvider } from '../utils/detectProvider.js';
import { CloudflareProvider } from './providers/cloudflareProvider.js';
import { Route53Provider } from './providers/route53Provider.js';
import { GoogleCloudDNSProvider } from './providers/googleCloudDNSProvider.js';
import { ManualProvider } from './providers/manualProvider.js';
import { IDNSProvider } from './providers/baseProvider.js';
import { setHosts, HostRecord } from './enomService.js';

// Re-export HostRecord type for convenience
export type { HostRecord };

/**
 * DNS Service
 * Dynamically loads and uses the appropriate DNS provider
 */
export class DNSService {
  private providers: Map<DNSProvider, IDNSProvider> = new Map();

  /**
   * Get or create a provider instance
   */
  private getProvider(provider: DNSProvider): IDNSProvider {
    if (!this.providers.has(provider)) {
      switch (provider) {
        case 'cloudflare':
          this.providers.set(provider, new CloudflareProvider());
          break;
        case 'route53':
          this.providers.set(provider, new Route53Provider());
          break;
        case 'google':
          this.providers.set(provider, new GoogleCloudDNSProvider());
          break;
        case 'manual':
        default:
          this.providers.set(provider, new ManualProvider());
          break;
      }
    }
    return this.providers.get(provider)!;
  }

  /**
   * Add DKIM TXT record to domain
   * @param domain - Domain name (e.g., "example.com")
   * @param selector - DKIM selector (e.g., "email")
   * @param publicKey - DKIM public key (PEM format, will be cleaned)
   * @param providerCredentials - Optional provider-specific credentials
   * @param forceProvider - Optional: force a specific provider instead of auto-detection
   * @returns Promise resolving to result object
   */
  async addDKIMRecord(
    domain: string,
    selector: string,
    publicKey: string,
    providerCredentials?: Record<string, any>,
    forceProvider?: DNSProvider
  ): Promise<{
    success: boolean;
    provider: DNSProvider;
    recordName: string;
    recordValue: string;
    message?: string;
    manualSetup?: boolean;
    recordId?: string;
  }> {
    try {
      // Clean public key (remove PEM headers/footers and newlines)
      const cleanPublicKey = publicKey
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\n/g, '')
        .replace(/\s/g, '');

      // Generate DKIM record value
      const recordValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;
      const recordName = `${selector}._domainkey`;

      // Detect or use forced provider
      const provider = forceProvider || (await detectProvider(domain));

      // Get appropriate provider instance
      const providerInstance = this.getProvider(provider);

      // Add the record
      const result = await providerInstance.addTXTRecord(
        domain,
        recordName,
        recordValue,
        providerCredentials || {}
      );

      return {
        success: result.success,
        provider,
        recordName,
        recordValue,
        message: result.message,
        manualSetup: (result as any).manualSetup || false,
        recordId: result.recordId,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'manual',
        recordName: `${selector}._domainkey`,
        recordValue: `v=DKIM1; k=rsa; p=${publicKey.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\n/g, '').replace(/\s/g, '')}`,
        message: `Error adding DKIM record: ${error.message}`,
        manualSetup: true,
      };
    }
  }

  /**
   * Add SPF TXT record to domain
   * @param domain - Domain name (e.g., "example.com")
   * @param spfRecord - SPF record value (e.g., "v=spf1 include:mail.example.com ~all")
   * @param providerCredentials - Optional provider-specific credentials
   * @param forceProvider - Optional: force a specific provider instead of auto-detection
   * @returns Promise resolving to result object
   */
  async addSPFRecord(
    domain: string,
    spfRecord: string,
    providerCredentials?: Record<string, any>,
    forceProvider?: DNSProvider
  ): Promise<{
    success: boolean;
    provider: DNSProvider;
    recordName: string;
    recordValue: string;
    message?: string;
    manualSetup?: boolean;
    recordId?: string;
  }> {
    try {
      const recordName = '@';
      
      // Detect or use forced provider
      const provider = forceProvider || (await detectProvider(domain));
      
      // Get appropriate provider instance
      const providerInstance = this.getProvider(provider);
      
      // Add the record
      const result = await providerInstance.addTXTRecord(
        domain,
        recordName,
        spfRecord,
        providerCredentials || {}
      );
      
      return {
        success: result.success,
        provider,
        recordName,
        recordValue: spfRecord,
        message: result.message,
        manualSetup: (result as any).manualSetup || false,
        recordId: result.recordId,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'manual',
        recordName: '@',
        recordValue: spfRecord,
        message: `Error adding SPF record: ${error.message}`,
        manualSetup: true,
      };
    }
  }

  /**
   * Add DMARC TXT record to domain
   * @param domain - Domain name (e.g., "example.com")
   * @param dmarcRecord - DMARC record value (e.g., "v=DMARC1; p=none; rua=mailto:dmarc@example.com")
   * @param providerCredentials - Optional provider-specific credentials
   * @param forceProvider - Optional: force a specific provider instead of auto-detection
   * @returns Promise resolving to result object
   */
  async addDMARCRecord(
    domain: string,
    dmarcRecord: string,
    providerCredentials?: Record<string, any>,
    forceProvider?: DNSProvider
  ): Promise<{
    success: boolean;
    provider: DNSProvider;
    recordName: string;
    recordValue: string;
    message?: string;
    manualSetup?: boolean;
    recordId?: string;
  }> {
    try {
      const recordName = '_dmarc';
      
      // Detect or use forced provider
      const provider = forceProvider || (await detectProvider(domain));
      
      // Get appropriate provider instance
      const providerInstance = this.getProvider(provider);
      
      // Add the record
      const result = await providerInstance.addTXTRecord(
        domain,
        recordName,
        dmarcRecord,
        providerCredentials || {}
      );
      
      return {
        success: result.success,
        provider,
        recordName,
        recordValue: dmarcRecord,
        message: result.message,
        manualSetup: (result as any).manualSetup || false,
        recordId: result.recordId,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'manual',
        recordName: '_dmarc',
        recordValue: dmarcRecord,
        message: `Error adding DMARC record: ${error.message}`,
        manualSetup: true,
      };
    }
  }

  /**
   * Verify DKIM TXT record exists for domain
   * @param domain - Domain name
   * @param selector - DKIM selector
   * @param expectedPublicKey - Optional: expected public key to verify against
   * @returns Promise resolving to verification result
   */
  async verifyDKIMRecord(
    domain: string,
    selector: string,
    expectedPublicKey?: string
  ): Promise<{
    verified: boolean;
    provider: DNSProvider;
    recordName: string;
    recordValue?: string;
    message?: string;
  }> {
    try {
      const recordName = `${selector}._domainkey`;
      
      // Detect provider
      const provider = await detectProvider(domain);
      const providerInstance = this.getProvider(provider);

      // Build expected value if public key provided
      let expectedValue: string | undefined;
      if (expectedPublicKey) {
        const cleanPublicKey = expectedPublicKey
          .replace(/-----BEGIN PUBLIC KEY-----/g, '')
          .replace(/-----END PUBLIC KEY-----/g, '')
          .replace(/\n/g, '')
          .replace(/\s/g, '');
        expectedValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;
      }

      // Verify the record
      const result = await providerInstance.verifyTXTRecord(
        domain,
        recordName,
        expectedValue
      );

      return {
        verified: result.verified,
        provider,
        recordName,
        recordValue: result.recordValue,
        message: result.message,
      };
    } catch (error: any) {
      return {
        verified: false,
        provider: 'manual',
        recordName: `${selector}._domainkey`,
        message: `Error verifying DKIM record: ${error.message}`,
      };
    }
  }

  /**
   * Verify SPF TXT record exists for domain
   * @param domain - Domain name
   * @param expectedValue - Optional: expected SPF record value to verify against
   * @returns Promise resolving to verification result
   */
  async verifySPFRecord(
    domain: string,
    expectedValue?: string
  ): Promise<{
    verified: boolean;
    provider: DNSProvider;
    recordName: string;
    recordValue?: string;
    message?: string;
  }> {
    try {
      // SPF record is at root domain (@)
      const recordName = '@';
      
      // Detect provider
      const provider = await detectProvider(domain);
      const providerInstance = this.getProvider(provider);

      // Verify the record (SPF can be part of a TXT record, so we check if it contains v=spf1)
      const result = await providerInstance.verifyTXTRecord(
        domain,
        recordName,
        expectedValue
      );

      // Additional check: if record exists, verify it contains SPF format
      let verified = result.verified;
      if (result.recordValue && !result.recordValue.includes('v=spf1')) {
        verified = false;
      }

      return {
        verified,
        provider,
        recordName: '@',
        recordValue: result.recordValue,
        message: verified
          ? 'SPF record verified successfully.'
          : result.message || 'SPF record not found or invalid.',
      };
    } catch (error: any) {
      return {
        verified: false,
        provider: 'manual',
        recordName: '@',
        message: `Error verifying SPF record: ${error.message}`,
      };
    }
  }

  /**
   * Verify DMARC TXT record exists for domain
   * @param domain - Domain name
   * @param expectedValue - Optional: expected DMARC record value to verify against
   * @returns Promise resolving to verification result
   */
  async verifyDMARCRecord(
    domain: string,
    expectedValue?: string
  ): Promise<{
    verified: boolean;
    provider: DNSProvider;
    recordName: string;
    recordValue?: string;
    message?: string;
  }> {
    try {
      const recordName = '_dmarc';
      
      // Detect provider
      const provider = await detectProvider(domain);
      const providerInstance = this.getProvider(provider);

      // Verify the record
      const result = await providerInstance.verifyTXTRecord(
        domain,
        recordName,
        expectedValue
      );

      // Additional check: if record exists, verify it contains DMARC format
      let verified = result.verified;
      if (result.recordValue && !result.recordValue.includes('v=DMARC1')) {
        verified = false;
      }

      return {
        verified,
        provider,
        recordName,
        recordValue: result.recordValue,
        message: verified
          ? 'DMARC record verified successfully.'
          : result.message || 'DMARC record not found or invalid.',
      };
    } catch (error: any) {
      return {
        verified: false,
        provider: 'manual',
        recordName: '_dmarc',
        message: `Error verifying DMARC record: ${error.message}`,
      };
    }
  }

  /**
   * Update host records for a domain using eNom SetHosts command
   * This method is specifically for domains managed by eNom.
   * It deletes all existing host records and replaces them with the provided records.
   * 
   * @param domain - Domain name (e.g., "example.com")
   * @param hostRecords - Array of host records to set (maximum 50 records)
   * @param responsetype - Response type: 'json', 'xml', or 'text' (default: 'xml')
   * @returns Promise resolving to result object
   */
  async updateHostRecords(
    domain: string,
    hostRecords: HostRecord[],
    responsetype: 'json' | 'xml' | 'text' = 'xml'
  ): Promise<{
    success: boolean;
    command: string;
    errorCount: number;
    errors?: string[];
    done?: string;
    message?: string;
  }> {
    try {
      // Parse domain into SLD and TLD
      const domainParts = domain.split('.');
      if (domainParts.length < 2) {
        throw new Error('Invalid domain format. Expected format: example.com');
      }

      const tld = domainParts[domainParts.length - 1];
      const sld = domainParts.slice(0, -1).join('.');

      // Use eNom SetHosts command
      const result = await setHosts(sld, tld, hostRecords, responsetype);

      return result;
    } catch (error: any) {
      return {
        success: false,
        command: 'SetHosts',
        errorCount: 1,
        errors: [error.message || 'Unknown error occurred'],
        message: `Error updating host records: ${error.message}`,
      };
    }
  }
}

// Export singleton instance
export const dnsService = new DNSService();


import { IDNSProvider } from './baseProvider.js';
import dns from 'dns/promises';

/**
 * Manual provider - returns instructions for manual DNS setup
 * Used as fallback when provider doesn't support API integration
 */
export class ManualProvider implements IDNSProvider {
  async addTXTRecord(
    domain: string,
    name: string,
    value: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; recordId?: string; message?: string; manualSetup?: boolean; recordName?: string; recordValue?: string }> {
    // Return manual setup instructions
    return {
      success: true,
      manualSetup: true,
      recordName: name,
      recordValue: value,
      message: 'Please add this record manually in your DNS provider dashboard.',
    };
  }

  async verifyTXTRecord(
    domain: string,
    name: string,
    expectedValue?: string
  ): Promise<{ verified: boolean; recordValue?: string; message?: string }> {
    try {
      // Handle root domain (@) - query the domain directly
      let fullName: string;
      if (name === '@' || name === '' || name === domain) {
        fullName = domain;
      } else if (name.includes(domain)) {
        fullName = name;
      } else {
        fullName = `${name}.${domain}`;
      }
      const records = await dns.resolveTxt(fullName);

      // Flatten array of arrays (DNS can return multiple TXT records)
      const allRecords = records.flat().join('');

      if (expectedValue) {
        // Check if expected value is contained in the record
        const verified = allRecords.includes(expectedValue);
        return {
          verified,
          recordValue: allRecords,
          message: verified
            ? 'DKIM record verified successfully.'
            : 'DKIM record found but value does not match expected.',
        };
      }

      // If no expected value, just check if record exists
      return {
        verified: allRecords.length > 0,
        recordValue: allRecords,
        message: allRecords.length > 0
          ? 'DKIM record found.'
          : 'DKIM record not found.',
      };
    } catch (error: any) {
      return {
        verified: false,
        message: `DNS lookup failed: ${error.message}`,
      };
    }
  }
}


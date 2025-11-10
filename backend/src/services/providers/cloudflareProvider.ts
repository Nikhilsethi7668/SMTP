import { IDNSProvider } from './baseProvider.js';
import dns from 'dns/promises';

/**
 * Cloudflare DNS Provider
 * Implements automatic DNS record management via Cloudflare API
 */
export class CloudflareProvider implements IDNSProvider {
  private readonly API_BASE_URL = 'https://api.cloudflare.com/client/v4';

  /**
   * Get Cloudflare Zone ID for a domain
   * @param domain - The domain name
   * @param apiToken - Cloudflare API token
   * @returns Promise resolving to zone ID
   */
  private async getZoneId(domain: string, apiToken: string): Promise<string> {
    const response = await fetch(`${this.API_BASE_URL}/zones?name=${domain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }));
      throw new Error(
        `Failed to get Cloudflare zone: ${error.errors?.[0]?.message || response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.result || data.result.length === 0) {
      throw new Error(`Domain ${domain} not found in Cloudflare account`);
    }

    return data.result[0].id;
  }

  /**
   * Add a TXT record via Cloudflare API
   */
  async addTXTRecord(
    domain: string,
    name: string,
    value: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; recordId?: string; message?: string }> {
    try {
      const apiToken = credentials.apiToken || credentials.token;
      if (!apiToken) {
        throw new Error('Cloudflare API token is required');
      }

      // Get zone ID
      const zoneId = await this.getZoneId(domain, apiToken);

      // Prepare record name (remove domain suffix if present)
      const recordName = name.endsWith(`.${domain}`) 
        ? name.replace(`.${domain}`, '') 
        : name;

      // Check if record already exists
      const existingRecords = await this.findExistingRecord(zoneId, recordName, apiToken);
      
      let recordId: string | undefined;
      if (existingRecords.length > 0) {
        // Update existing record
        recordId = existingRecords[0].id;
        const updateResponse = await fetch(
          `${this.API_BASE_URL}/zones/${zoneId}/dns_records/${recordId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'TXT',
              name: recordName,
              content: value,
              ttl: 3600,
            }),
          }
        );

        if (!updateResponse.ok) {
          const error = await updateResponse.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }));
          throw new Error(
            `Failed to update DNS record: ${error.errors?.[0]?.message || updateResponse.statusText}`
          );
        }

        return {
          success: true,
          recordId,
          message: 'DKIM record updated successfully in Cloudflare.',
        };
      } else {
        // Create new record
        const createResponse = await fetch(
          `${this.API_BASE_URL}/zones/${zoneId}/dns_records`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'TXT',
              name: recordName,
              content: value,
              ttl: 3600,
            }),
          }
        );

        if (!createResponse.ok) {
          const error = await createResponse.json().catch(() => ({ errors: [{ message: 'Unknown error' }] }));
          throw new Error(
            `Failed to create DNS record: ${error.errors?.[0]?.message || createResponse.statusText}`
          );
        }

        const data = await createResponse.json();
        return {
          success: true,
          recordId: data.result?.id,
          message: 'DKIM record added successfully to Cloudflare.',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to add DNS record to Cloudflare',
      };
    }
  }

  /**
   * Find existing TXT records matching the name
   */
  private async findExistingRecord(
    zoneId: string,
    recordName: string,
    apiToken: string
  ): Promise<Array<{ id: string; content: string }>> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/zones/${zoneId}/dns_records?type=TXT&name=${recordName}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Verify TXT record exists via DNS lookup
   */
  async verifyTXTRecord(
    domain: string,
    name: string,
    expectedValue?: string
  ): Promise<{ verified: boolean; recordValue?: string; message?: string }> {
    try {
      const fullName = name.includes(domain) ? name : `${name}.${domain}`;
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
            ? 'DKIM record verified successfully in Cloudflare.'
            : 'DKIM record found but value does not match expected.',
        };
      }

      // If no expected value, just check if record exists
      return {
        verified: allRecords.length > 0,
        recordValue: allRecords,
        message: allRecords.length > 0
          ? 'DKIM record found in Cloudflare.'
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


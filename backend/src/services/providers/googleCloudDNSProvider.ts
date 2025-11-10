import { IDNSProvider } from './baseProvider.js';
import dns from 'dns/promises';

/**
 * Google Cloud DNS Provider
 * Implements automatic DNS record management via Google Cloud DNS API
 * 
 * NOTE: Requires Google Cloud credentials (projectId, credentials)
 * Credentials can be:
 * - Service account JSON key
 * - OAuth2 access token
 * - Application default credentials (if running on GCP)
 */
export class GoogleCloudDNSProvider implements IDNSProvider {
  private readonly API_BASE_URL = 'https://dns.googleapis.com/dns/v1';

  /**
   * Get Google Cloud access token from credentials
   * 
   * NOTE: For service account authentication, use googleapis library to get access token:
   * ```ts
   * import { google } from 'googleapis';
   * const auth = new google.auth.GoogleAuth({
   *   keyFile: 'path/to/service-account.json',
   *   scopes: ['https://www.googleapis.com/auth/cloud-platform'],
   * });
   * const client = await auth.getClient();
   * const accessToken = await client.getAccessToken();
   * ```
   */
  private async getAccessToken(credentials: Record<string, any>): Promise<string> {
    // If access token is provided directly, use it
    if (credentials.accessToken) {
      return credentials.accessToken;
    }

    // If service account JSON is provided, user should use googleapis library
    // to exchange it for an access token before calling this provider
    if (credentials.serviceAccountKey) {
      throw new Error(
        'Service account key provided. Please use googleapis library to exchange it for an accessToken, ' +
        'or provide accessToken directly. See provider documentation for details.'
      );
    }

    throw new Error('Google Cloud accessToken is required');
  }

  /**
   * Get Google Cloud DNS Managed Zone ID for a domain
   */
  private async getManagedZoneId(
    projectId: string,
    domain: string,
    accessToken: string
  ): Promise<string> {
    const url = `${this.API_BASE_URL}/projects/${projectId}/managedZones?dnsName=${domain}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(
        `Failed to get Google Cloud DNS zone: ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.managedZones || data.managedZones.length === 0) {
      throw new Error(`Domain ${domain} not found in Google Cloud DNS project ${projectId}`);
    }

    // Find exact match or closest match
    const exactMatch = data.managedZones.find((zone: any) => zone.dnsName === `${domain}.`);
    const zone = exactMatch || data.managedZones[0];

    return zone.name;
  }

  /**
   * Find existing TXT record
   */
  private async findExistingRecord(
    projectId: string,
    managedZoneId: string,
    recordName: string,
    accessToken: string
  ): Promise<{ name: string; rrdatas: string[] } | null> {
    try {
      const url = `${this.API_BASE_URL}/projects/${projectId}/managedZones/${managedZoneId}/rrsets?name=${encodeURIComponent(recordName)}&type=TXT`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.rrsets && data.rrsets.length > 0) {
        return data.rrsets[0];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Add a TXT record via Google Cloud DNS API
   */
  async addTXTRecord(
    domain: string,
    name: string,
    value: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; recordId?: string; message?: string }> {
    try {
      const { projectId, accessToken, serviceAccountKey } = credentials;

      if (!projectId) {
        throw new Error('Google Cloud projectId is required');
      }

      // Get access token
      const token = await this.getAccessToken(credentials);

      // Get managed zone ID
      const managedZoneId = await this.getManagedZoneId(projectId, domain, token);

      // Prepare record name (ensure it ends with domain and dot)
      const recordName = name.endsWith(`.${domain}.`)
        ? name
        : name.endsWith(`.${domain}`)
        ? `${name}.`
        : `${name}.${domain}.`;

      // Check if record already exists
      const existingRecord = await this.findExistingRecord(
        projectId,
        managedZoneId,
        recordName,
        token
      );

      if (existingRecord) {
        // Update existing record
        const url = `${this.API_BASE_URL}/projects/${projectId}/managedZones/${managedZoneId}/rrsets`;
        const requestBody = {
          additions: [
            {
              name: recordName,
              type: 'TXT',
              ttl: 3600,
              rrdatas: [`"${value}"`],
            },
          ],
          deletions: [existingRecord],
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
          throw new Error(
            `Failed to update DNS record: ${error.error?.message || response.statusText}`
          );
        }

        const data = await response.json();
        return {
          success: true,
          recordId: data.additions?.[0]?.name,
          message: 'DKIM record updated successfully in Google Cloud DNS.',
        };
      } else {
        // Create new record
        const url = `${this.API_BASE_URL}/projects/${projectId}/managedZones/${managedZoneId}/rrsets`;
        const requestBody = {
          additions: [
            {
              name: recordName,
              type: 'TXT',
              ttl: 3600,
              rrdatas: [`"${value}"`],
            },
          ],
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
          throw new Error(
            `Failed to create DNS record: ${error.error?.message || response.statusText}`
          );
        }

        const data = await response.json();
        return {
          success: true,
          recordId: data.additions?.[0]?.name,
          message: 'DKIM record added successfully to Google Cloud DNS.',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to add DNS record to Google Cloud DNS',
      };
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
            ? 'DKIM record verified successfully in Google Cloud DNS.'
            : 'DKIM record found but value does not match expected.',
        };
      }

      // If no expected value, just check if record exists
      return {
        verified: allRecords.length > 0,
        recordValue: allRecords,
        message: allRecords.length > 0
          ? 'DKIM record found in Google Cloud DNS.'
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


import { IDNSProvider } from './baseProvider.js';
import dns from 'dns/promises';
import crypto from 'crypto';

/**
 * AWS Route53 DNS Provider
 * Implements automatic DNS record management via AWS Route53 API
 * 
 * NOTE: Requires AWS credentials (accessKeyId, secretAccessKey, region)
 * For production, consider using IAM roles or AWS SDK with credential chain
 */
export class Route53Provider implements IDNSProvider {
  private readonly API_BASE_URL = 'https://route53.amazonaws.com/2013-04-01';
  private readonly SERVICE = 'route53';
  private readonly ALGORITHM = 'AWS4-HMAC-SHA256';

  /**
   * Generate AWS Signature V4 for Route53 API requests
   */
  private async signRequest(
    method: string,
    url: string,
    body: string,
    credentials: { accessKeyId: string; secretAccessKey: string; region: string }
  ): Promise<HeadersInit> {
    const { accessKeyId, secretAccessKey, region } = credentials;
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
    const date = dateStamp.slice(0, 8);
    const amzDate = dateStamp;

    // Parse URL
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const path = urlObj.pathname;
    const queryString = urlObj.search.slice(1);

    // Create canonical request
    const canonicalHeaders = [
      `host:${host}`,
      `x-amz-date:${amzDate}`,
    ].join('\n') + '\n';

    const signedHeaders = 'host;x-amz-date';
    const payloadHash = crypto.createHash('sha256').update(body || '').digest('hex');
    
    const canonicalRequest = [
      method,
      path,
      queryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    // Create string to sign
    const credentialScope = `${date}/${region}/${this.SERVICE}/aws4_request`;
    const stringToSign = [
      this.ALGORITHM,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${secretAccessKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(this.SERVICE).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    // Create authorization header
    const authorization = `${this.ALGORITHM} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      'Host': host,
      'X-Amz-Date': amzDate,
      'Authorization': authorization,
      'Content-Type': 'application/xml',
    };
  }

  /**
   * Get Route53 Hosted Zone ID for a domain
   */
  private async getHostedZoneId(
    domain: string,
    credentials: { accessKeyId: string; secretAccessKey: string; region: string }
  ): Promise<string> {
    const url = `${this.API_BASE_URL}/hostedzone?name=${domain}`;
    const headers = await this.signRequest('GET', url, '', credentials);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get Route53 hosted zone: ${response.statusText} - ${text}`);
    }

    const xml = await response.text();
    // Simple XML parsing for zone ID (in production, use proper XML parser)
    const zoneIdMatch = xml.match(/<Id>\/hostedzone\/([^<]+)<\/Id>/);
    if (!zoneIdMatch) {
      throw new Error(`Domain ${domain} not found in Route53 account`);
    }

    return zoneIdMatch[1];
  }

  /**
   * Find existing TXT record
   */
  private async findExistingRecord(
    hostedZoneId: string,
    recordName: string,
    credentials: { accessKeyId: string; secretAccessKey: string; region: string }
  ): Promise<string | null> {
    try {
      const url = `${this.API_BASE_URL}/hostedzone/${hostedZoneId}/rrset?name=${encodeURIComponent(recordName)}&type=TXT`;
      const headers = await this.signRequest('GET', url, '', credentials);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return null;
      }

      const xml = await response.text();
      // Check if record exists
      if (xml.includes('<ResourceRecordSet>')) {
        const changeIdMatch = xml.match(/<ChangeInfo>.*?<Id>\/change\/([^<]+)<\/Id>/s);
        return changeIdMatch ? changeIdMatch[1] : null;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create or update TXT record via Route53 API
   */
  async addTXTRecord(
    domain: string,
    name: string,
    value: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; recordId?: string; message?: string }> {
    try {
      const { accessKeyId, secretAccessKey, region = 'us-east-1' } = credentials;

      if (!accessKeyId || !secretAccessKey) {
        throw new Error('AWS credentials (accessKeyId, secretAccessKey) are required');
      }

      // Get hosted zone ID
      const hostedZoneId = await this.getHostedZoneId(domain, {
        accessKeyId,
        secretAccessKey,
        region,
      });

      // Prepare record name (ensure it ends with domain)
      const recordName = name.endsWith(`.${domain}`)
        ? name
        : `${name}.${domain}`;

      // Check if record exists
      const existingChangeId = await this.findExistingRecord(hostedZoneId, recordName, {
        accessKeyId,
        secretAccessKey,
        region,
      });

      // Build XML request body
      const changeResourceRecordSets = existingChangeId
        ? `<ChangeResourceRecordSetsRequest xmlns="https://route53.amazonaws.com/doc/2013-04-01/">
            <ChangeBatch>
              <Changes>
                <Change>
                  <Action>UPSERT</Action>
                  <ResourceRecordSet>
                    <Name>${recordName}</Name>
                    <Type>TXT</Type>
                    <TTL>3600</TTL>
                    <ResourceRecords>
                      <ResourceRecord>
                        <Value>"${value}"</Value>
                      </ResourceRecord>
                    </ResourceRecords>
                  </ResourceRecordSet>
                </Change>
              </Changes>
            </ChangeBatch>
          </ChangeResourceRecordSetsRequest>`
        : `<ChangeResourceRecordSetsRequest xmlns="https://route53.amazonaws.com/doc/2013-04-01/">
            <ChangeBatch>
              <Changes>
                <Change>
                  <Action>CREATE</Action>
                  <ResourceRecordSet>
                    <Name>${recordName}</Name>
                    <Type>TXT</Type>
                    <TTL>3600</TTL>
                    <ResourceRecords>
                      <ResourceRecord>
                        <Value>"${value}"</Value>
                      </ResourceRecord>
                    </ResourceRecords>
                  </ResourceRecordSet>
                </Change>
              </Changes>
            </ChangeBatch>
          </ChangeResourceRecordSetsRequest>`;

      const url = `${this.API_BASE_URL}/hostedzone/${hostedZoneId}/rrset`;
      const headers = await this.signRequest('POST', url, changeResourceRecordSets, {
        accessKeyId,
        secretAccessKey,
        region,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: changeResourceRecordSets,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create/update DNS record: ${response.statusText} - ${text}`);
      }

      const xml = await response.text();
      const changeIdMatch = xml.match(/<Id>\/change\/([^<]+)<\/Id>/);
      const changeId = changeIdMatch ? changeIdMatch[1] : undefined;

      return {
        success: true,
        recordId: changeId,
        message: 'DKIM record added successfully to Route53.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to add DNS record to Route53',
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
            ? 'DKIM record verified successfully in Route53.'
            : 'DKIM record found but value does not match expected.',
        };
      }

      // If no expected value, just check if record exists
      return {
        verified: allRecords.length > 0,
        recordValue: allRecords,
        message: allRecords.length > 0
          ? 'DKIM record found in Route53.'
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


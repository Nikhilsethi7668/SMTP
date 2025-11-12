import axios from 'axios';
import { parseStringPromise } from 'xml2js';

/**
 * Enom API Service
 * Handles domain search, availability checking, and purchase through Enom API
 */
export class EnomService {
  private readonly baseUrl: string;
  private readonly uid: string;
  private readonly pw: string;
  private readonly useTestEnvironment: boolean;

  constructor() {
    this.useTestEnvironment = process.env.ENOM_USE_TEST === 'true';
    this.baseUrl = this.useTestEnvironment
      ? 'https://resellertest.enom.com'
      : 'https://reseller.enom.com';
    this.uid = process.env.ENOM_RESELLER_ID || '';
    this.pw = process.env.ENOM_API_TOKEN || '';

    if (!this.uid || !this.pw) {
      console.warn('Enom credentials not configured. Domain purchase features will not work.');
    }
  }

  /**
   * Parse XML response to JSON
   */
  private async parseXML(xml: string): Promise<any> {
    return parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });
  }

  /**
   * Make API call to Enom
   */
  private async makeApiCall(command: string, params: Record<string, string> = {}): Promise<any> {
    const queryParams = new URLSearchParams({
      command,
      uid: this.uid,
      pw: this.pw,
      responsetype: 'xml',
      ...params,
    });

    try {

      console.log(`${this.baseUrl}/interface.asp?${queryParams.toString()}`);
      const response = await axios.get(`${this.baseUrl}/interface.asp?${queryParams.toString()}`);
      const parsed = await this.parseXML(response.data);
      
      // Extract the main response object
      const interfaceResponse = parsed.interfaceResponse || parsed;
      
      // Check for errors
      if (interfaceResponse.ErrCount && parseInt(interfaceResponse.ErrCount) > 0) {
        const errors = Array.isArray(interfaceResponse.errors?.string)
          ? interfaceResponse.errors.string
          : [interfaceResponse.errors?.string || interfaceResponse.Err1];
        
        throw new Error(
          `Enom API Error: ${errors.join(', ')} (Code: ${interfaceResponse.ErrCode || 'Unknown'})`
        );
      }

      return interfaceResponse;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Enom API request failed: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Check domain availability
   * @param sld - Second level domain (e.g., "example")
   * @param tld - Top level domain (e.g., "com")
   */
  async checkDomain(sld: string, tld: string): Promise<{
    available: boolean;
    domain: string;
    price?: number;
    premium?: boolean;
  }> {
    const response = await this.makeApiCall('check', { sld, tld });
    console.log(response);
    
    const domain = `${sld}.${tld}`;
    const available = response.RRPCode === '210' || response.RRPCode === '211';
    
    return {
      available,
      domain,
      price: response.PremiumRegistrationPrice
        ? parseFloat(response.PremiumRegistrationPrice)
        : undefined,
      premium: response.IsPremiumName === 'true',
    };
  }

  /**
   * Check multiple domains at once
   */
  async checkMultipleDomains(domains: Array<{ sld: string; tld: string }>): Promise<Array<{
    available: boolean;
    domain: string;
    price?: number;
    premium?: boolean;
  }>> {
    const results = await Promise.all(
      domains.map(({ sld, tld }) => this.checkDomain(sld, tld))
    );
    return results;
  }

  /**
   * Search for domain suggestions
   * @param keyword - Search keyword
   * @param tlds - Array of TLDs to search (default: ['com', 'net', 'org'])
   */
  async searchDomains(
    keyword: string,
    tlds: string[] = ['com', 'net', 'org', 'io', 'co']
  ): Promise<Array<{
    available: boolean;
    domain: string;
    price?: number;
    premium?: boolean;
  }>> {
    // Remove special characters and spaces
    const cleanKeyword = keyword.replace(/[^a-z0-9-]/gi, '').toLowerCase();
    
    // Generate domain suggestions
    const suggestions: Array<{ sld: string; tld: string }> = [];
    
    // Add exact match
    tlds.forEach(tld => {
      suggestions.push({ sld: cleanKeyword, tld });
    });
    
    // Add variations
    const variations = [
      `${cleanKeyword}app`,
      `${cleanKeyword}io`,
      `${cleanKeyword}tech`,
      `${cleanKeyword}online`,
      `get${cleanKeyword}`,
      `${cleanKeyword}pro`,
    ];
    
    variations.forEach(sld => {
      tlds.slice(0, 3).forEach(tld => {
        suggestions.push({ sld, tld });
      });
    });

    // Check all suggestions
    const results = await this.checkMultipleDomains(suggestions);
    console.log(results);
    
    return results;
  }

  /**
   * Get domain pricing information
   */
  async getDomainPricing(sld: string, tld: string, years: number = 1): Promise<{
    registrationPrice: number;
    renewalPrice: number;
    transferPrice?: number;
    totalPrice: number;
  }> {
    const response = await this.makeApiCall('GetExtendInfo', { sld, tld });
    
    const registrationPrice = parseFloat(response.ProductPrice || '0');
    const renewalPrice = parseFloat(response.RenewalPrice || response.ProductPrice || '0');
    const transferPrice = response.TransferPrice
      ? parseFloat(response.TransferPrice)
      : undefined;

    return {
      registrationPrice,
      renewalPrice,
      totalPrice: registrationPrice * years,
      transferPrice,
    };
  }

  /**
   * Purchase a domain
   * @param sld - Second level domain
   * @param tld - Top level domain
   * @param years - Number of years to register (default: 1)
   * @param registrantInfo - Domain registrant information
   */
  async purchaseDomain(
    sld: string,
    tld: string,
    years: number = 1,
    registrantInfo: {
      FirstName: string;
      LastName: string;
      EmailAddress: string;
      Phone: string;
      Address1: string;
      City: string;
      StateProvince: string;
      PostalCode: string;
      Country: string;
      OrganizationName?: string;
    }
  ): Promise<{
    orderId: string;
    domain: string;
    status: string;
    expirationDate?: string;
  }> {
    const params: Record<string, string> = {
      sld,
      tld,
      NumYears: years.toString(),
      // Registrant information
      'RegistrantFirstName': registrantInfo.FirstName,
      'RegistrantLastName': registrantInfo.LastName,
      'RegistrantEmailAddress': registrantInfo.EmailAddress,
      'RegistrantPhone': registrantInfo.Phone,
      'RegistrantAddress1': registrantInfo.Address1,
      'RegistrantCity': registrantInfo.City,
      'RegistrantStateProvince': registrantInfo.StateProvince,
      'RegistrantPostalCode': registrantInfo.PostalCode,
      'RegistrantCountry': registrantInfo.Country,
      // Copy registrant info to other contact types (Admin, Tech, Billing)
      'AdminFirstName': registrantInfo.FirstName,
      'AdminLastName': registrantInfo.LastName,
      'AdminEmailAddress': registrantInfo.EmailAddress,
      'AdminPhone': registrantInfo.Phone,
      'AdminAddress1': registrantInfo.Address1,
      'AdminCity': registrantInfo.City,
      'AdminStateProvince': registrantInfo.StateProvince,
      'AdminPostalCode': registrantInfo.PostalCode,
      'AdminCountry': registrantInfo.Country,
      'TechFirstName': registrantInfo.FirstName,
      'TechLastName': registrantInfo.LastName,
      'TechEmailAddress': registrantInfo.EmailAddress,
      'TechPhone': registrantInfo.Phone,
      'TechAddress1': registrantInfo.Address1,
      'TechCity': registrantInfo.City,
      'TechStateProvince': registrantInfo.StateProvince,
      'TechPostalCode': registrantInfo.PostalCode,
      'TechCountry': registrantInfo.Country,
      'AuxBillingFirstName': registrantInfo.FirstName,
      'AuxBillingLastName': registrantInfo.LastName,
      'AuxBillingEmailAddress': registrantInfo.EmailAddress,
      'AuxBillingPhone': registrantInfo.Phone,
      'AuxBillingAddress1': registrantInfo.Address1,
      'AuxBillingCity': registrantInfo.City,
      'AuxBillingStateProvince': registrantInfo.StateProvince,
      'AuxBillingPostalCode': registrantInfo.PostalCode,
      'AuxBillingCountry': registrantInfo.Country,
    };

    if (registrantInfo.OrganizationName) {
      params['RegistrantOrganizationName'] = registrantInfo.OrganizationName;
      params['AdminOrganizationName'] = registrantInfo.OrganizationName;
      params['TechOrganizationName'] = registrantInfo.OrganizationName;
      params['AuxBillingOrganizationName'] = registrantInfo.OrganizationName;
    }

    const response = await this.makeApiCall('Purchase', params);

    return {
      orderId: response.OrderID || response.DomainNameID || '',
      domain: `${sld}.${tld}`,
      status: response.Status || 'pending',
      expirationDate: response.ExpirationDate,
    };
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<number> {
    const response = await this.makeApiCall('GetBalance');
    return parseFloat(response.Balance || '0');
  }
}

export const enomService = new EnomService();


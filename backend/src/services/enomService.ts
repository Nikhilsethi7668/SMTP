import axios from 'axios';
import { parseStringPromise } from 'xml2js';

/**
 * Enom API Service
 * Handles domain search, availability checking, and purchase through Enom API
 */

// Configuration helpers
const getEnomConfig = () => {
  const useTestEnvironment = process.env.ENOM_USE_TEST === 'true';
  const baseUrl = useTestEnvironment
    ? 'https://resellertest.enom.com'
    : 'https://reseller.enom.com';
  // Use env variables if available, otherwise use fallback credentials
  const uid = process.env.ENOM_RESELLER_ID || 'apexbyteinc';
  const pw = process.env.ENOM_API_TOKEN || '67BMECH5AA7PUFQQUMLVZELETWA32DCBRQGOEIQF';

  return { baseUrl, uid, pw };
};

/**
 * Parse XML response to JSON
 */
async function parseXML(xml: string): Promise<any> {
  return parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });
}

/**
 * Make API call to Enom
 * This is the central function that all Enom API calls go through
 */
export async function makeApiCall(command: string, params: Record<string, string> = {}): Promise<any> {
  const { baseUrl, uid, pw } = getEnomConfig();
  const responsetype = params.responsetype || 'json';
  // Remove responsetype from params to avoid duplication
  const { responsetype: _, ...restParams } = params;
  const queryParams = new URLSearchParams({
    command,
    uid,
    pw,
    responsetype,
    ...restParams,
  });

  try {
    console.log(`${baseUrl}/interface.asp?${queryParams.toString()}`);
    const response = await axios.get(`${baseUrl}/interface.asp?${queryParams.toString()}`);
    
    // Handle JSON or XML response based on responsetype
    let interfaceResponse: any;
    
    if (responsetype === 'json') {
      // Response is already JSON
      const data = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
      // Extract nested interface-response if present
      interfaceResponse = data['interface-response'] || data.interfaceResponse || data;
    } else {
      // Parse XML response
      const parsed = await parseXML(response.data);
      // Handle both hyphenated and camelCase versions
      interfaceResponse = parsed['interface-response'] || parsed.interfaceResponse || parsed;
    }
    
    // Check for errors
    if (interfaceResponse.ErrCount && parseInt(interfaceResponse.ErrCount) > 0) {
      let errors: string[] = [];
      
      // Handle different error structures
      if (interfaceResponse.errors) {
        // XML structure: <errors><Err1>...</Err1><Err2>...</Err2></errors>
        if (interfaceResponse.errors.Err1) {
          // Collect all Err1, Err2, Err3, etc.
          Object.keys(interfaceResponse.errors).forEach(key => {
            if (key.startsWith('Err') && interfaceResponse.errors[key]) {
              errors.push(interfaceResponse.errors[key]);
            }
          });
        } else if (Array.isArray(interfaceResponse.errors.string)) {
          errors = interfaceResponse.errors.string;
        } else if (interfaceResponse.errors.string) {
          errors = [interfaceResponse.errors.string];
        }
      }
      
      // Fallback to Err1 if no errors found in errors object
      if (errors.length === 0 && interfaceResponse.Err1) {
        errors = [interfaceResponse.Err1];
      }
      
      if (errors.length > 0) {
        throw new Error(
          `Enom API Error: ${errors.join(', ')} (Code: ${interfaceResponse.ErrCode || 'Unknown'})`
        );
      }
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
 * Check domain availability and get pricing details
 * Uses Enom check command with pricing parameters:
 * http://resellertest.enom.com/interface.asp?UID=resellid&PW=resellpw&SLD=all&TLD=email&Command=check&responsetype=xml&version=2&includeprice=1&includeproperties=1&includeeap=1
 * @param sld - Second level domain (e.g., "example")
 * @param tld - Top level domain (e.g., "com")
 */
export async function checkDomain(sld: string, tld: string): Promise<{
  available: boolean;
  domain: string;
  price?: number;
  premium?: boolean;
  registrationPrice?: number;
  renewalPrice?: number;
  transferPrice?: number;
  rrpCode?: string;
}> {
  // Use check command with pricing parameters to get detailed pricing information
  const response = await makeApiCall('check', { 
    sld, 
    tld,
    version: '2',
    includeprice: '1',
    includeproperties: '1',
    includeeap: '1',
    responsetype: 'xml' // Use XML to get more detailed pricing info
  });
  console.log('Check domain response:', response);
  
  const domain = `${sld}.${tld}`;
  
  // Extract domain information from nested XML structure
  // Response structure: interface-response > Domains > Domain > Prices
  const domainData = response.Domains?.Domain;
  
  // Handle both single domain object and array of domains
  const domainInfo = Array.isArray(domainData) ? domainData[0] : domainData;
  
  const rrpCode = domainInfo?.RRPCode || response.RRPCode;
  const available = rrpCode === '210' || rrpCode === '211';
  
  // Extract pricing information from nested Prices structure
  const prices = domainInfo?.Prices;
  const registrationPrice = prices?.Registration
    ? parseFloat(prices.Registration) 
    : (response.ProductPrice ? parseFloat(response.ProductPrice) : undefined);
  
  const renewalPrice = prices?.Renewal
    ? parseFloat(prices.Renewal)
    : (response.RenewalPrice ? parseFloat(response.RenewalPrice) : registrationPrice);
  
  const transferPrice = prices?.Transfer
    ? parseFloat(prices.Transfer)
    : (response.TransferPrice ? parseFloat(response.TransferPrice) : undefined);
  
  const isPremium = domainInfo?.IsPremium === 'True' || domainInfo?.IsPremium === true || response.IsPremiumName === 'true';
  
  // Use registration price as final price
  const finalPrice = registrationPrice;
  
  return {
    available,
    domain,
    price: finalPrice,
    premium: isPremium,
    registrationPrice: finalPrice,
    renewalPrice,
    transferPrice,
    rrpCode: rrpCode || response.RRPCode,
  };
}

/**
 * Check multiple domains at once
 */
export async function checkMultipleDomains(domains: Array<{ sld: string; tld: string }>): Promise<Array<{
  available: boolean;
  domain: string;
  price?: number;
  premium?: boolean;
}>> {
  const results = await Promise.all(
    domains.map(({ sld, tld }) => checkDomain(sld, tld))
  );
  return results;
}

/**
 * Search for domain suggestions using NameSpinner API
 * @param searchTerm - Search keyword/term
 * @param additionalParams - Optional additional parameters to pass to NameSpinner API
 */
export async function searchDomains(
  searchTerm: string,
  additionalParams: Record<string, string> = {}
): Promise<Array<{
  available: boolean;
  domain: string;
  price?: number;
  premium?: boolean;
}>> {
  // Get configuration
  const { baseUrl, uid, pw } = getEnomConfig();
  
  // Clean the search term
  const cleanSearchTerm = searchTerm.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  
  // Build exact URL with exact parameter order as shown in example
  // https://resellertest.enom.com/interface.asp?command=NameSpinner&SearchTerm=netwit&uid=apexbyteinc&pw=67BMECH5AA7PUFQQUMLVZELETWA32DCBRQGOEIQF&responsetype=xml
  const urlParams = new URLSearchParams();
  urlParams.append('command', 'NameSpinner');
  urlParams.append('SearchTerm', cleanSearchTerm);
  urlParams.append('uid', uid);
  urlParams.append('pw', pw);
  urlParams.append('responsetype', 'xml');
  
  // Add any additional parameters
  Object.keys(additionalParams).forEach(key => {
    if (additionalParams[key]) {
      urlParams.append(key, additionalParams[key]);
    }
  });
  
  const url = `${baseUrl}/interface.asp?${urlParams.toString()}`;
  
  try {
    // Make direct API call
    const response = await axios.get(url);
    const parsed = await parseXML(response.data);
    const interfaceResponse = parsed['interface-response'] || parsed.interfaceResponse || parsed;
     
    const domains = interfaceResponse.namespin?.domains?.domain;
    console.log('domains', domains);
    if (interfaceResponse.ErrCount && parseInt(interfaceResponse.ErrCount) > 0) {
      let errors: string[] = [];
      
      if (interfaceResponse.errors) {
        if (interfaceResponse.errors.Err1) {
          Object.keys(interfaceResponse.errors).forEach(key => {
            if (key.startsWith('Err') && interfaceResponse.errors[key]) {
              errors.push(interfaceResponse.errors[key]);
            }
          });
        } else if (Array.isArray(interfaceResponse.errors.string)) {
          errors = interfaceResponse.errors.string;
        } else if (interfaceResponse.errors.string) {
          errors = [interfaceResponse.errors.string];
        }
      }
      
      if (errors.length === 0 && interfaceResponse.Err1) {
        errors = [interfaceResponse.Err1];
      }
      
      if (errors.length > 0) {
        throw new Error(
          `Enom API Error: ${errors.join(', ')} (Code: ${interfaceResponse.ErrCode || 'Unknown'})`
        );
      }
    }
    
    // Transform domains data to extract available domains
    const availableDomains: Array<{
      available: boolean;
      domain: string;
      price?: number;
      premium?: boolean;
    }> = [];
    
    if (domains) {
      // Handle both array and single object cases
      const domainsArray = Array.isArray(domains) ? domains : [domains];
      
      domainsArray.forEach((domainObj: any) => {
        const domainName = domainObj.name;
        
        // List of TLD fields to check (excluding name and score fields)
        const tldFields = Object.keys(domainObj).filter(key => 
          key !== 'name' && !key.endsWith('score')
        );
        
        // For each TLD field, check if it's available ('y')
        tldFields.forEach(tld => {
          if (domainObj[tld] === 'y') {
            availableDomains.push({
              available: true,
              domain: `${domainName}.${tld}`,
              price: undefined,
              premium: false,
            });
          }
        });
      });
    }
    
    return availableDomains;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Enom API request failed: ${error.response.statusText}`);
    }
    throw error;
  }
}

/**
 * Get domain pricing information using check command
 * Uses Enom check command with pricing parameters:
 * http://resellertest.enom.com/interface.asp?UID=resellid&PW=resellpw&SLD=all&TLD=email&Command=check&responsetype=xml&version=2&includeprice=1&includeproperties=1&includeeap=1
 * @param sld - Second level domain (e.g., "example")
 * @param tld - Top level domain (e.g., "com")
 * @param years - Number of years (default: 1)
 */
export async function getDomainPricing(sld: string, tld: string, years: number = 1): Promise<{
  registrationPrice: number;
  renewalPrice: number;
  transferPrice?: number;
  totalPrice: number;
}> {
  // Use check command with pricing parameters to get pricing information
  const response = await makeApiCall('check', { 
    sld, 
    tld,
    version: '2',
    includeprice: '1',
    includeproperties: '1',
    includeeap: '1',
    responsetype: 'xml' // Use XML to get more detailed pricing info
  });  
  // Extract domain information from nested XML structure
  // Response structure: interface-response > Domains > Domain > Prices
  const domainData = response.Domains?.Domain;
  
  // Handle both single domain object and array of domains
  const domainInfo = Array.isArray(domainData) ? domainData[0] : domainData;
  
  // Extract pricing information from nested Prices structure
  const prices = domainInfo?.Prices;
  const registrationPrice = prices?.Registration
    ? parseFloat(prices.Registration) 
    : (response.ProductPrice ? parseFloat(response.ProductPrice) : 0);
  
  const renewalPrice = prices?.Renewal
    ? parseFloat(prices.Renewal)
    : (response.RenewalPrice ? parseFloat(response.RenewalPrice) : registrationPrice);
  
  const transferPrice = prices?.Transfer
    ? parseFloat(prices.Transfer)
    : (response.TransferPrice ? parseFloat(response.TransferPrice) : undefined);
  
  // Use registration price (already includes premium pricing if applicable)
  const finalRegistrationPrice = registrationPrice;

  return {
    registrationPrice: finalRegistrationPrice,
    renewalPrice,
    totalPrice: finalRegistrationPrice * years,
    transferPrice,
  };
}

/**
 * Purchase a domain
 * Uses Enom Purchase command: https://resellertest.enom.com/interface.asp?command=Purchase&uid=YourAccountID&pw=YourApiToken&EndUserIP={Required}&SLD={Required}&TLD={Required}&responsetype=xml
 * @param sld - Second level domain
 * @param tld - Top level domain
 * @param endUserIP - End user IP address (required)
 * @param years - Number of years to register (default: 1)
 * @param registrantInfo - Domain registrant information
 */
export async function purchaseDomain(
  sld: string,
  tld: string,
  endUserIP: string,
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
    EndUserIP: endUserIP,
    NumYears: years.toString(),
    responsetype: 'xml',
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

  console.log(`Calling Enom Purchase API for ${sld}.${tld} with ${years} year(s)`);
  const response = await makeApiCall('Purchase', params);
  console.log('Enom Purchase API response:', JSON.stringify(response, null, 2));

  // Check for errors
  if (response.ErrCount && parseInt(response.ErrCount) > 0) {
    let errors: string[] = [];
    
    if (response.errors) {
      if (response.errors.Err1) {
        Object.keys(response.errors).forEach(key => {
          if (key.startsWith('Err') && response.errors[key]) {
            errors.push(response.errors[key]);
          }
        });
      } else if (Array.isArray(response.errors.string)) {
        errors = response.errors.string;
      } else if (response.errors.string) {
        errors = [response.errors.string];
      }
    }
    
    if (errors.length === 0 && response.Err1) {
      errors = [response.Err1];
    }
    
    if (errors.length > 0) {
      throw new Error(`Enom API Error: ${errors.join(', ')}`);
    }
  }

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
export async function getBalance(): Promise<number> {
  const response = await makeApiCall('GetBalance');
  return parseFloat(response.Balance || '0');
}

/**
 * Generic function to call any Enom API command
 * Use this for any Enom API endpoints not covered by specific functions above
 * @param command - The Enom API command (e.g., 'GetDomainInfo', 'GetDNS', etc.)
 * @param params - Parameters to pass to the API
 * @param responsetype - Response type: 'json' or 'xml' (default: 'json')
 */
export async function callEnomApi(
  command: string,
  params: Record<string, string> = {},
  responsetype: 'json' | 'xml' = 'json'
): Promise<any> {
  return makeApiCall(command, { ...params, responsetype });
}

// Export all functions as a default object for backward compatibility
export const enomService = {
  makeApiCall,
  callEnomApi,
  checkDomain,
  checkMultipleDomains,
  searchDomains,
  getDomainPricing,
  purchaseDomain,
  getBalance,
};

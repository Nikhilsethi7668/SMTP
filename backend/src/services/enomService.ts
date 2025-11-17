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
    
    // Handle JSON or XML response
    // Note: Enom API sometimes returns XML even when JSON is requested, so we detect the format
    let interfaceResponse: any;
    
    // Check if response is XML (starts with <?xml or <interface-response or any XML tag)
    const responseText = typeof response.data === 'string' ? response.data : '';
    const isXML = responseText.trim().startsWith('<?xml') || 
                  responseText.trim().startsWith('<interface-response') || 
                  (responseText.trim().startsWith('<') && !responseText.trim().startsWith('{'));
    
    if (responsetype === 'json' && !isXML && typeof response.data !== 'string') {
      // Response is already an object (parsed JSON)
      interfaceResponse = response.data['interface-response'] || response.data.interfaceResponse || response.data;
    } else if (responsetype === 'json' && !isXML) {
      // Response is JSON string
      try {
        const data = JSON.parse(response.data);
        // Extract nested interface-response if present
        interfaceResponse = data['interface-response'] || data.interfaceResponse || data;
      } catch (parseError) {
        // If JSON parsing fails, try XML parsing instead (Enom returned XML despite JSON request)
        console.warn('JSON parsing failed, attempting XML parsing. Response may be XML format:', parseError);
        const parsed = await parseXML(response.data);
        interfaceResponse = parsed['interface-response'] || parsed.interfaceResponse || parsed;
      }
    } else {
      // Parse XML response (either explicitly requested or detected)
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
 * Check registration status for a domain that was previously purchased.
 * Uses the GetDomainInfo command to verify whether the domain is active.
 * @param sld - Second level domain (e.g., "example")
 * @param tld - Top level domain (e.g., "com")
 */
export async function getDomainRegistrationStatus(
  sld: string,
  tld: string
): Promise<{
  registered: boolean;
  status?: string;
  expirationDate?: string;
  rawResponse: any;
}> {
  const domainName = `${sld}.${tld}`;
  // Always request XML format and convert to JSON, as Enom API sometimes returns XML even when JSON is requested
  const response = await makeApiCall('GetDomainInfo', {
    SLD: sld,
    TLD: tld,
    DomainName: domainName,
    responsetype: 'xml', // Request XML and convert to JSON
  });
console.log(response);
  const registered = response?.GetDomainInfo?.status.registrationstatus === 'Registered';
    

  const expirationDate = response?.GetDomainInfo?.status.expiration;

  return {
    registered,
    status: response?.GetDomainInfo?.status.registrationstatus,
    expirationDate,
    rawResponse: response,
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
 * Host record type definition
 */
export interface HostRecord {
  hostName: string;
  recordType: 'A' | 'AAAA' | 'CNAME' | 'URL' | 'FRAME' | 'MX' | 'MXE' | 'TXT';
  address: string;
  mxPref?: number; // Optional, only used with MX record type (default: 10)
}

/**
 * Update host records for a domain using SetHosts command
 * This command deletes all existing host records and replaces them with the records you supply.
 * 
 * @param sld - Second-level domain name (e.g., "enom" in "enom.com")
 * @param tld - Top-level domain name (extension, e.g., "com")
 * @param hostRecords - Array of host records to set (maximum 50 records)
 * @param responsetype - Response type: 'json', 'xml', or 'text' (default: 'xml')
 * @returns Promise resolving to result object
 */
export async function setHosts(
  sld: string,
  tld: string,
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
  if (!hostRecords || hostRecords.length === 0) {
    throw new Error('At least one host record is required');
  }

  if (hostRecords.length > 50) {
    throw new Error('Maximum 50 host records allowed');
  }

  // Build parameters for each host record
  const params: Record<string, string> = {
    SLD: sld,
    TLD: tld,
    responsetype,
  };

  // Add indexed parameters for each host record
  hostRecords.forEach((record, index) => {
    const x = index + 1; // Index starts at 1
    params[`HostName${x}`] = record.hostName;
    params[`RecordType${x}`] = record.recordType;
    params[`Address${x}`] = record.address;

    // Add MX preference if record type is MX and mxPref is provided
    if (record.recordType === 'MX' && record.mxPref !== undefined) {
      params[`MXPref${x}`] = record.mxPref.toString();
    } else if (record.recordType === 'MX') {
      // Default MX preference is 10 if not provided
      params[`MXPref${x}`] = '10';
    }
  });

  try {
    const response = await makeApiCall('SetHosts', params);
    
    // Check for errors
    const errorCount = parseInt(response.ErrCount || '0', 10);
    const errors: string[] = [];

    if (errorCount > 0) {
      // Collect all error messages
      for (let i = 1; i <= errorCount; i++) {
        const errorKey = `Err${i}`;
        if (response[errorKey]) {
          errors.push(response[errorKey]);
        } else if (response.errors?.[errorKey]) {
          errors.push(response.errors[errorKey]);
        }
      }
    }

    return {
      success: errorCount === 0,
      command: response.Command || 'SetHosts',
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      done: response.Done,
      message: errorCount === 0 
        ? 'Host records updated successfully' 
        : `Failed to update host records: ${errors.join(', ')}`,
    };
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

/**
 * Generic Enom API call function matching the format:
 * https://resellertest.enom.com/interface.asp?command=nameofcommand&uid=yourloginid&pw=yourpassword&paramname=paramvalue&nextparamname=nextparamvalue
 * 
 * This is a wrapper around makeApiCall that provides a cleaner interface for calling any Enom API command.
 * @param command - The Enom API command name (e.g., 'GetDomainInfo', 'Purchase', 'check', etc.)
 * @param params - Additional parameters as key-value pairs (uid and pw are automatically added)
 * @param responsetype - Response type: 'json' or 'xml' (default: 'json')
 * @returns Promise with the API response
 */
export async function callEnomCommand(
  command: string,
  params: Record<string, string> = {},
  responsetype: 'json' | 'xml' = 'json'
): Promise<any> {
  // makeApiCall already handles uid, pw, and responsetype automatically
  return makeApiCall(command, { ...params, responsetype });
}

// Export all functions as a default object for backward compatibility
export const enomService = {
  makeApiCall,
  callEnomApi,
  callEnomCommand,
  checkDomain,
  checkMultipleDomains,
  searchDomains,
  getDomainPricing,
  getDomainRegistrationStatus,
  purchaseDomain,
  getBalance,
  setHosts,
};

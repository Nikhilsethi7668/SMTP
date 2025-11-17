import { Request, Response } from 'express';
import { enomService, HostRecord } from '../services/enomService.js';
import { PurchasedDomain } from '../models/unifiedDomainModel.js';

/**
 * Search for available domains using NameSpinner API
 * GET /api/purchase-domains/search?SearchTerm=example
 * Or with additional NameSpinner parameters
 * GET /api/purchase-domains/search?SearchTerm=example&MaxResults=50
 */
export const searchDomains = async (req: Request, res: Response) => {
  try {
    const { SearchTerm, keyword, ...additionalParams } = req.query;

    // Support both SearchTerm and keyword for backward compatibility
    const searchTerm = (SearchTerm || keyword) as string;

    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'SearchTerm or keyword parameter is required',
      });
    }

    // Convert all additional query params to strings and pass them to NameSpinner
    const params: Record<string, string> = {};
    Object.keys(additionalParams).forEach((key) => {
      const value = additionalParams[key];
      if (value !== undefined && value !== null) {
        params[key] = String(value);
      }
    });

    const results = await enomService.searchDomains(searchTerm, params);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error('Error searching domains:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search domains',
      error: error.message,
    });
  }
};

/**
 * Check domain availability and get pricing
 * GET /api/purchase-domains/check?sld=example&tld=com
 * POST /api/purchase-domains/check
 * Body: { sld: "example", tld: "com" }
 * or
 * Body: { domains: [{ sld: "example", tld: "com" }, ...] }
 */
export const checkDomain = async (req: Request, res: Response) => {
  try {
    // Support both GET (query params) and POST (body)
    const sld = (req.query.sld || req.body.sld) as string;
    const tld = (req.query.tld || req.body.tld) as string;
    const domains = req.body.domains;

    if (domains && Array.isArray(domains)) {
      // Check multiple domains
      const results = await enomService.checkMultipleDomains(domains);
      return res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    }

    if (!sld || !tld) {
      return res.status(400).json({
        success: false,
        message: 'sld and tld are required (as query params for GET or in body for POST), or provide domains array',
      });
    }

    const result = await enomService.checkDomain(sld, tld);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error checking domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check domain availability',
      error: error.message,
    });
  }
};

/**
 * Get domain pricing information
 * GET /api/purchase-domains/pricing?sld=example&tld=com&years=1
 */
export const getDomainPricing = async (req: Request, res: Response) => {
  try {
    const { sld, tld, years = '1' } = req.query;

    if (!sld || !tld) {
      return res.status(400).json({
        success: false,
        message: 'sld and tld query parameters are required',
      });
    }

    const yearsNum = parseInt(years as string, 10) || 1;
    const pricing = await enomService.getDomainPricing(
      sld as string,
      tld as string,
      yearsNum
    );

    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error: any) {
    console.error('Error getting domain pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get domain pricing',
      error: error.message,
    });
  }
};

/**
 * Purchase a domain
 * POST /api/purchase-domains/purchase
 * Body: {
 *   sld: "example",
 *   tld: "com",
 *   years: 1,
 *   registrantInfo: { ... }
 * }
 */
export const purchaseDomain = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { sld, tld, years = 1, registrantInfo } = req.body;

    if (!sld || !tld) {
      return res.status(400).json({
        success: false,
        message: 'sld and tld are required',
      });
    }

    if (!registrantInfo) {
      return res.status(400).json({
        success: false,
        message: 'registrantInfo is required',
      });
    }

    // Validate required registrant fields
    const requiredFields = [
      'FirstName',
      'LastName',
      'EmailAddress',
      'Phone',
      'Address1',
      'City',
      'StateProvince',
      'PostalCode',
      'Country',
    ];

    const missingFields = requiredFields.filter(
      (field) => !registrantInfo[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required registrant fields: ${missingFields.join(', ')}`,
      });
    }

    // Check domain availability first
    const availability = await enomService.checkDomain(sld, tld);
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: `Domain ${sld}.${tld} is not available for purchase`,
      });
    }

    // Get pricing
    const pricing = await enomService.getDomainPricing(sld, tld, years);

    // Get client IP from request
    const clientIP = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
                     req.ip || 
                     req.socket.remoteAddress || 
                     '0.0.0.0';

    // Purchase domain through Enom using Purchase command with EndUserIP
    const purchaseResult = await enomService.purchaseDomain(
      sld,
      tld,
      clientIP,
      years,
      registrantInfo
    );

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + years);

    // Save purchase record to database
    // Don't set userId if user is admin
    const purchasedDomain = new PurchasedDomain({
      ...(userRole !== 'admin' && { userId: userId }),
      domain: `${sld}.${tld}`,
      sld,
      tld,
      orderId: purchaseResult.orderId,
      purchaseStatus: purchaseResult.status === 'pending' ? 'pending' : 'active', // Use purchaseStatus for unified model
      domainType: 'purchased' as const, // Set domain type
      years,
      expirationDate,
      purchaseDate: new Date(),
      price: pricing.totalPrice,
      registrantInfo: {
        firstName: registrantInfo.FirstName,
        lastName: registrantInfo.LastName,
        email: registrantInfo.EmailAddress,
        phone: registrantInfo.Phone,
        address1: registrantInfo.Address1,
        city: registrantInfo.City,
        stateProvince: registrantInfo.StateProvince,
        postalCode: registrantInfo.PostalCode,
        country: registrantInfo.Country,
        organizationName: registrantInfo.OrganizationName,
      },
      enomResponse: purchaseResult,
    });

    await purchasedDomain.save();

    res.status(201).json({
      success: true,
      message: 'Domain purchased successfully',
      data: {
        ...purchasedDomain.toObject(),
        purchaseResult,
      },
    });
  } catch (error: any) {
    console.error('Error purchasing domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase domain',
      error: error.message,
    });
  }
};

/**
 * Check the registration status of a purchased domain using Enom API
 * POST /api/purchase-domains/my-domains/:id/check-status
 */
export const checkPurchasedDomainStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Purchased domain ID is required',
      });
    }

    const purchasedDomain = await PurchasedDomain.findOne({
      _id: id,
      userId: userId,
    });

    if (!purchasedDomain) {
      return res.status(404).json({
        success: false,
        message: 'Purchased domain not found',
      });
    }

    if (!purchasedDomain.sld || !purchasedDomain.tld) {
      return res.status(400).json({
        success: false,
        message: 'Purchased domain is missing SLD/TLD information',
      });
    }

    const registrationStatus = await enomService.getDomainRegistrationStatus(
      purchasedDomain.sld,
      purchasedDomain.tld
    );

    // Update purchaseStatus in database based on exact registration status from Enom
    let statusUpdated = false;
    
    if (registrationStatus.registered) {
      // Domain is registered/active
      if (purchasedDomain.purchaseStatus !== 'active') {
        purchasedDomain.purchaseStatus = 'active';
        purchasedDomain.enomResponse = registrationStatus.rawResponse;
        statusUpdated = true;
      }
    } else if (registrationStatus.status === 'Failed') {
      // Domain registration failed
      if (purchasedDomain.purchaseStatus !== 'failed') {
        purchasedDomain.purchaseStatus = 'failed';
        purchasedDomain.enomResponse = registrationStatus.rawResponse;
        statusUpdated = true;
      }
    } else if (registrationStatus.status === 'Expired') {
      // Domain has expired
      if (purchasedDomain.purchaseStatus !== 'expired') {
        purchasedDomain.purchaseStatus = 'expired';
        statusUpdated = true;
      }
    } else {
      // Still pending registration
      if (purchasedDomain.purchaseStatus !== 'pending') {
        purchasedDomain.purchaseStatus = 'pending';
        statusUpdated = true;
      }
    }

    // Update expiration date if provided
    if (registrationStatus.expirationDate) {
      const newExpirationDate = new Date(registrationStatus.expirationDate);
      if (!purchasedDomain.expirationDate || 
          purchasedDomain.expirationDate.getTime() !== newExpirationDate.getTime()) {
        purchasedDomain.expirationDate = newExpirationDate;
        statusUpdated = true;
      }
    }

    // Save only if status or expiration date was updated
    if (statusUpdated) {
      await purchasedDomain.save();
    }

    res.status(200).json({
      success: true,
      data: {
        domain: purchasedDomain.toObject(),
        registrationStatus,
        statusUpdated,
      },
    });
  } catch (error: any) {
    console.error('Error checking purchased domain status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check purchased domain status',
      error: error.message,
    });
  }
};

/**
 * Get user's purchased domains
 * GET /api/purchase-domains/my-domains
 */
export const getMyPurchasedDomains = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search, status, purchaseStatus } = req.query;

    const query: any = { userId: userId };

    if (search) {
      query.domain = { $regex: search, $options: 'i' };
    }

    // Support both status and purchaseStatus for backward compatibility
    if (purchaseStatus) {
      query.purchaseStatus = purchaseStatus;
    } else if (status) {
      query.purchaseStatus = status;
    }

    const domains = await PurchasedDomain.find(query)
      .sort({ purchaseDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error: any) {
    console.error('Error fetching purchased domains:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchased domains',
      error: error.message,
    });
  }
};

/**
 * Get purchased domain by ID
 * GET /api/purchase-domains/:id
 */
export const getPurchasedDomainById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const domain = await PurchasedDomain.findOne({
      _id: id,
      userId: userId,
    }).lean();

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Purchased domain not found',
      });
    }

    res.status(200).json({
      success: true,
      data: domain,
    });
  } catch (error: any) {
    console.error('Error fetching purchased domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchased domain',
      error: error.message,
    });
  }
};

/**
 * Get Enom account balance (for admin/testing)
 * GET /api/purchase-domains/balance
 */
export const getEnomBalance = async (req: Request, res: Response) => {
  try {
    const balance = await enomService.getBalance();

    res.status(200).json({
      success: true,
      data: {
        balance,
        currency: 'USD',
      },
    });
  } catch (error: any) {
    console.error('Error fetching Enom balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Enom account balance',
      error: error.message,
    });
  }
};

/**
 * Generic Enom API command endpoint
 * POST /api/purchase-domains/enom-command
 * Body: { command: 'GetDomainInfo', params: { SLD: 'example', TLD: 'com' }, responsetype: 'json' }
 * 
 * This allows calling any Enom API command with custom parameters.
 * Format matches: https://resellertest.enom.com/interface.asp?command=nameofcommand&uid=yourloginid&pw=yourpassword&paramname=paramvalue
 */
export const callEnomCommand = async (req: Request, res: Response) => {
  try {
    const { command, params = {}, responsetype = 'json' } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Command parameter is required and must be a string',
      });
    }

    if (typeof params !== 'object' || Array.isArray(params)) {
      return res.status(400).json({
        success: false,
        message: 'Params must be an object with string key-value pairs',
      });
    }

    // Convert all params to strings as Enom API expects string values
    const stringParams: Record<string, string> = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        stringParams[key] = String(params[key]);
      }
    });

    const response = await enomService.callEnomCommand(
      command,
      stringParams,
      responsetype === 'xml' ? 'xml' : 'json'
    );

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Error calling Enom command:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to call Enom API command',
      error: error.message,
    });
  }
};

/**
 * Set DNS records for a purchased domain using Enom SetHosts command
 * POST /api/purchase-domains/my-domains/:id/set-dns
 */
export const setPurchasedDomainDNS = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Purchased domain ID is required',
      });
    }

    // Get the purchased domain from database
    const purchasedDomain = await PurchasedDomain.findOne({
      _id: id,
      userId: userId,
    });

    if (!purchasedDomain) {
      return res.status(404).json({
        success: false,
        message: 'Purchased domain not found',
      });
    }

    if (!purchasedDomain.sld || !purchasedDomain.tld) {
      return res.status(400).json({
        success: false,
        message: 'Purchased domain is missing SLD/TLD information',
      });
    }

    // Check if DNS records exist in database
    if (!purchasedDomain.spf_record || !purchasedDomain.dkim_public_key || !purchasedDomain.dmarc_record) {
      return res.status(400).json({
        success: false,
        message: 'DNS records not found for this domain. Please ensure the domain has been properly configured.',
      });
    }

    // Build host records array for Enom SetHosts command
    const hostRecords: HostRecord[] = [];

    // SPF Record - hostname is "@" for root domain
    if (purchasedDomain.spf_record) {
      hostRecords.push({
        hostName: '@',
        recordType: 'TXT',
        address: purchasedDomain.spf_record,
      });
    }

    // DKIM Record - hostname is "{selector}._domainkey"
    if (purchasedDomain.dkim_public_key) {
      const dkimSelector = purchasedDomain.dkim_selector || 'email';
      // Format DKIM record: v=DKIM1; k=rsa; p={publicKey}
      // The public key is already cleaned (no PEM headers) in the database
      const dkimRecordValue = `v=DKIM1; k=rsa; p=${purchasedDomain.dkim_public_key}`;
      hostRecords.push({
        hostName: `${dkimSelector}._domainkey`,
        recordType: 'TXT',
        address: dkimRecordValue,
      });
    }

    // DMARC Record - hostname is "_dmarc"
    if (purchasedDomain.dmarc_record) {
      hostRecords.push({
        hostName: '_dmarc',
        recordType: 'TXT',
        address: purchasedDomain.dmarc_record,
      });
    }

    if (hostRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No DNS records to set',
      });
    }

    // Call Enom SetHosts API
    const result = await enomService.setHosts(
      purchasedDomain.sld,
      purchasedDomain.tld,
      hostRecords,
      'xml'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to set DNS records',
        errors: result.errors,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message || 'DNS records set successfully',
      data: {
        domain: purchasedDomain.domain,
        recordsSet: hostRecords.length,
        result,
      },
    });
  } catch (error: any) {
    console.error('Error setting DNS records for purchased domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set DNS records',
      error: error.message,
    });
  }
};

// Note: Cart operations (addToCart, deleteFromCart) have been moved to domainCartController
// These functions used Enom cart APIs which have been removed


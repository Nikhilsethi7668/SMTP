import { Request, Response } from 'express';
import { enomService } from '../services/enomService.js';
import { PurchasedDomain } from '../models/purchasedDomainModel.js';

/**
 * Search for available domains
 * GET /api/purchase-domains/search?keyword=example&tlds=com,net,org
 */
export const searchDomains = async (req: Request, res: Response) => {
  try {
    const { keyword, tlds } = req.query;

    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Keyword parameter is required',
      });
    }

    // Parse TLDs from query string
    const tldArray = tlds
      ? (typeof tlds === 'string' ? tlds.split(',') : [])
      : ['com', 'net', 'org', 'io', 'co'];

    const results = await enomService.searchDomains(keyword, tldArray);

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
 * Check domain availability
 * POST /api/purchase-domains/check
 * Body: { sld: "example", tld: "com" }
 * or
 * Body: { domains: [{ sld: "example", tld: "com" }, ...] }
 */
export const checkDomain = async (req: Request, res: Response) => {
  try {
    const { sld, tld, domains } = req.body;

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
        message: 'sld and tld are required, or provide domains array',
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

    // Purchase domain through Enom
    const purchaseResult = await enomService.purchaseDomain(
      sld,
      tld,
      years,
      registrantInfo
    );

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + years);

    // Save purchase record to database
    const purchasedDomain = new PurchasedDomain({
      user_id: userId,
      domain: `${sld}.${tld}`,
      sld,
      tld,
      orderId: purchaseResult.orderId,
      status: purchaseResult.status === 'pending' ? 'pending' : 'active',
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
 * Get user's purchased domains
 * GET /api/purchase-domains/my-domains
 */
export const getMyPurchasedDomains = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search, status } = req.query;

    const query: any = { user_id: userId };

    if (search) {
      query.domain = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
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
      user_id: userId,
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


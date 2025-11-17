import { Request, Response } from 'express';
import { DomainCart } from '../models/domainCartModel.js';
import { enomService } from '../services/enomService.js';
import { PurchasedDomain } from '../models/unifiedDomainModel.js';

/**
 * Get user's cart items
 * GET /api/domain-cart
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const cartItems = await DomainCart.find({
      user_id: userId,
      status: 'active',
    })
      .sort({ addedAt: -1 })
      .lean();

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    res.status(200).json({
      success: true,
      count: cartItems.length,
      total,
      data: cartItems,
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart items',
      error: error.message,
    });
  }
};

/**
 * Add domain to cart
 * POST /api/domain-cart
 * Body: {
 *   domain: "example.com",
 *   sld: "example",
 *   tld: "com",
 *   years?: 1,
 *   endUserIP?: "192.168.1.1"
 * }
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { 
      domain, 
      sld, 
      tld, 
      years = 1, 
      endUserIP,
      // Pricing data from frontend (optional - will fetch if not provided)
      registrationPrice: frontendRegistrationPrice,
      renewalPrice: frontendRenewalPrice,
      transferPrice: frontendTransferPrice,
      totalPrice: frontendTotalPrice,
      premium: frontendPremium,
      available: frontendAvailable,
      rrpCode: frontendRrpCode,
    } = req.body;

    if (!domain || !sld || !tld) {
      return res.status(400).json({
        success: false,
        message: 'domain, sld, and tld are required',
      });
    }

    // Check if domain already exists in cart
    const existingItem = await DomainCart.findOne({
      user_id: userId,
      domain,
      status: 'active',
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Domain already exists in cart',
        data: existingItem,
      });
    }

    // Use pricing from frontend if provided, otherwise fetch from Enom API
    let pricing;
    let available = frontendAvailable !== undefined ? frontendAvailable : true;
    let premium = frontendPremium || false;
    let rrpCode = frontendRrpCode;

    if (frontendRegistrationPrice !== undefined && frontendTotalPrice !== undefined) {
      // Use pricing data from frontend
      pricing = {
        registrationPrice: frontendRegistrationPrice,
        renewalPrice: frontendRenewalPrice || frontendRegistrationPrice,
        transferPrice: frontendTransferPrice,
        totalPrice: frontendTotalPrice,
      };
      
      // If availability not provided, check from Enom
      if (frontendAvailable === undefined) {
        try {
          const checkResult = await enomService.checkDomain(sld, tld);
          available = checkResult.available;
          premium = checkResult.premium || premium;
          rrpCode = checkResult.rrpCode || rrpCode;
        } catch (error: any) {
          console.error('Error checking domain availability:', error);
          // Continue with frontend data if check fails
        }
      }
    } else {
      // Fetch pricing from Enom API if not provided from frontend
      try {
        const checkResult = await enomService.checkDomain(sld, tld);
        available = checkResult.available;
        premium = checkResult.premium || false;
        rrpCode = checkResult.rrpCode;

        if (available) {
          pricing = await enomService.getDomainPricing(sld, tld, years);
        } else {
          return res.status(400).json({
            success: false,
            message: 'Domain is not available for purchase',
          });
        }
      } catch (error: any) {
        console.error('Error fetching domain pricing:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get domain pricing',
          error: error.message,
        });
      }
    }

    // Note: Enom cart operations removed - using local cart only
    let enomItemNumber;
    let enomCartId;

    // Create cart item
    const cartItem = new DomainCart({
      user_id: userId,
      domain,
      sld,
      tld,
      available,
      premium,
      registrationPrice: pricing.registrationPrice,
      renewalPrice: pricing.renewalPrice,
      transferPrice: pricing.transferPrice,
      totalPrice: pricing.totalPrice,
      years,
      enomItemNumber,
      enomCartId,
      rrpCode,
      status: 'active',
      addedAt: new Date(),
    });

    await cartItem.save();

    res.status(201).json({
      success: true,
      message: 'Domain added to cart successfully',
      data: cartItem,
    });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add domain to cart',
      error: error.message,
    });
  }
};

/**
 * Remove domain from cart
 * DELETE /api/domain-cart/:id
 * or
 * DELETE /api/domain-cart
 * Body: { domain: "example.com" }
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { domain } = req.body;

    let cartItem;

    if (id) {
      // Remove by ID
      cartItem = await DomainCart.findOne({
        _id: id,
        user_id: userId,
        status: 'active',
      });
    } else if (domain) {
      // Remove by domain name
      cartItem = await DomainCart.findOne({
        domain,
        user_id: userId,
        status: 'active',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either id parameter or domain in body is required',
      });
    }

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    // If item has Enom item number, try to remove from Enom cart
    // Note: Enom cart operations removed - using local cart only

    // Update status to removed
    cartItem.status = 'removed';
    await cartItem.save();

    res.status(200).json({
      success: true,
      message: 'Domain removed from cart successfully',
      data: cartItem,
    });
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove domain from cart',
      error: error.message,
    });
  }
};

/**
 * Clear all items from cart
 * DELETE /api/domain-cart/clear
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const cartItems = await DomainCart.find({
      user_id: userId,
      status: 'active',
    });

    // Note: Enom cart operations removed - using local cart only

    // Update all items to removed status
    await DomainCart.updateMany(
      {
        user_id: userId,
        status: 'active',
      },
      {
        status: 'removed',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      count: cartItems.length,
    });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
};

/**
 * Update cart item (e.g., change years)
 * PUT /api/domain-cart/:id
 * Body: {
 *   years?: 2,
 *   ...
 * }
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { years, ...otherUpdates } = req.body;

    const cartItem = await DomainCart.findOne({
      _id: id,
      user_id: userId,
      status: 'active',
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    // If years changed, update pricing
    if (years && years !== cartItem.years) {
      try {
        const pricing = await enomService.getDomainPricing(
          cartItem.sld,
          cartItem.tld,
          years
        );

        cartItem.years = years;
        cartItem.registrationPrice = pricing.registrationPrice;
        cartItem.renewalPrice = pricing.renewalPrice;
        cartItem.transferPrice = pricing.transferPrice;
        cartItem.totalPrice = pricing.totalPrice;
      } catch (error: any) {
        console.error('Error updating pricing:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update pricing',
          error: error.message,
        });
      }
    }

    // Update other fields if provided
    Object.keys(otherUpdates).forEach((key) => {
      if (otherUpdates[key] !== undefined) {
        (cartItem as any)[key] = otherUpdates[key];
      }
    });

    await cartItem.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: cartItem,
    });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

/**
 * Purchase all domains from cart
 * POST /api/domain-cart/purchase
 * Body: {
 *   registrantInfo: {
 *     FirstName: "John",
 *     LastName: "Doe",
 *     EmailAddress: "john@example.com",
 *     Phone: "+1234567890",
 *     Address1: "123 Main St",
 *     City: "New York",
 *     StateProvince: "NY",
 *     PostalCode: "10001",
 *     Country: "US",
 *     OrganizationName?: "Company Inc"
 *   },
 *   endUserIP?: "192.168.1.1"
 * }
 */
export const purchaseFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { registrantInfo, endUserIP } = req.body;

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

    // Get all active cart items for the user
    const cartItems = await DomainCart.find({
      user_id: userId,
      status: 'active',
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add domains to cart before purchasing.',
      });
    }

    // Get client IP from request if not provided
    const clientIP = endUserIP || 
                     req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
                     req.ip || 
                     req.socket.remoteAddress || 
                     '0.0.0.0';

    const purchaseResults = [];
    const errors = [];

    // Purchase each domain from cart
    for (const cartItem of cartItems) {
      try {
        // Purchase domain using Enom Purchase API
        const purchaseResult = await enomService.purchaseDomain(
          cartItem.sld,
          cartItem.tld,
          clientIP,
          cartItem.years,
          registrantInfo
        );

        // Calculate expiration date
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + cartItem.years);

        // Save to PurchasedDomain model
        // Don't set userId if user is admin
        const purchasedDomain = new PurchasedDomain({
          ...(userRole !== 'admin' && { userId: userId }),
          domain: cartItem.domain,
          sld: cartItem.sld,
          tld: cartItem.tld,
          orderId: purchaseResult.orderId,
          purchaseStatus: purchaseResult.status === 'pending' ? 'pending' : 'active',
          domainType: 'purchased' as const,
          years: cartItem.years,
          expirationDate,
          purchaseDate: new Date(),
          price: cartItem.totalPrice,
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

        // Update cart item status to purchased
        cartItem.status = 'purchased';
        cartItem.purchasedAt = new Date();
        await cartItem.save();

        purchaseResults.push({
          domain: cartItem.domain,
          orderId: purchaseResult.orderId,
          status: purchaseResult.status,
          success: true,
        });
      } catch (error: any) {
        console.error(`Error purchasing ${cartItem.domain}:`, error);
        errors.push({
          domain: cartItem.domain,
          error: error.message,
        });
      }
    }

    if (purchaseResults.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to purchase any domains',
        errors,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${purchaseResults.length} domain(s)`,
      data: {
        purchased: purchaseResults,
        errors: errors.length > 0 ? errors : undefined,
        totalPurchased: purchaseResults.length,
        totalFailed: errors.length,
      },
    });
  } catch (error: any) {
    console.error('Error purchasing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase domains from cart',
      error: error.message,
    });
  }
};


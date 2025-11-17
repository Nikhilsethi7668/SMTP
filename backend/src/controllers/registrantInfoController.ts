import { Request, Response } from 'express';
import { RegistrantInfo } from '../models/registrantInfoModel.js';

/**
 * Get user's registrant information
 * GET /api/registrant-info
 */
export const getRegistrantInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get default registrant info if exists, otherwise get the most recent one
    let registrantInfo = await RegistrantInfo.findOne({
      user_id: userId,
      isDefault: true,
    });

    if (!registrantInfo) {
      // Get the most recently created one
      registrantInfo = await RegistrantInfo.findOne({
        user_id: userId,
      }).sort({ createdAt: -1 });
    }

    if (!registrantInfo) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No registrant information found',
      });
    }

    res.status(200).json({
      success: true,
      data: registrantInfo,
    });
  } catch (error: any) {
    console.error('Error fetching registrant info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrant information',
      error: error.message,
    });
  }
};

/**
 * Get all registrant information for a user
 * GET /api/registrant-info/all
 */
export const getAllRegistrantInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const registrantInfos = await RegistrantInfo.find({
      user_id: userId,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: registrantInfos,
      count: registrantInfos.length,
    });
  } catch (error: any) {
    console.error('Error fetching all registrant info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrant information',
      error: error.message,
    });
  }
};

/**
 * Save or update registrant information
 * POST /api/registrant-info
 * Body: {
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "john@example.com",
 *   phone: "+1234567890",
 *   address1: "123 Main St",
 *   address2?: "Apt 4B",
 *   city: "New York",
 *   stateProvince: "NY",
 *   postalCode: "10001",
 *   country: "US",
 *   organizationName?: "Company Inc",
 *   isDefault?: true
 * }
 */
export const saveRegistrantInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      address1,
      address2,
      city,
      stateProvince,
      postalCode,
      country,
      organizationName,
      isDefault = false,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address1',
      'city',
      'stateProvince',
      'postalCode',
      'country',
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await RegistrantInfo.updateMany(
        { user_id: userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Create new registrant info
    const registrantInfo = new RegistrantInfo({
      user_id: userId,
      firstName,
      lastName,
      email,
      phone,
      address1,
      address2,
      city,
      stateProvince,
      postalCode,
      country: country || 'US',
      organizationName,
      isDefault,
    });

    await registrantInfo.save();

    res.status(201).json({
      success: true,
      message: 'Registrant information saved successfully',
      data: registrantInfo,
    });
  } catch (error: any) {
    console.error('Error saving registrant info:', error);
    
    // Handle duplicate default error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You can only have one default registrant information',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save registrant information',
      error: error.message,
    });
  }
};

/**
 * Update registrant information
 * PUT /api/registrant-info/:id
 */
export const updateRegistrantInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    const registrantInfo = await RegistrantInfo.findOne({
      _id: id,
      user_id: userId,
    });

    if (!registrantInfo) {
      return res.status(404).json({
        success: false,
        message: 'Registrant information not found',
      });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault === true) {
      await RegistrantInfo.updateMany(
        { user_id: userId, isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        (registrantInfo as any)[key] = updateData[key];
      }
    });

    await registrantInfo.save();

    res.status(200).json({
      success: true,
      message: 'Registrant information updated successfully',
      data: registrantInfo,
    });
  } catch (error: any) {
    console.error('Error updating registrant info:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You can only have one default registrant information',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update registrant information',
      error: error.message,
    });
  }
};

/**
 * Delete registrant information
 * DELETE /api/registrant-info/:id
 */
export const deleteRegistrantInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const registrantInfo = await RegistrantInfo.findOneAndDelete({
      _id: id,
      user_id: userId,
    });

    if (!registrantInfo) {
      return res.status(404).json({
        success: false,
        message: 'Registrant information not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registrant information deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting registrant info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete registrant information',
      error: error.message,
    });
  }
};

/**
 * Set default registrant information
 * PATCH /api/registrant-info/:id/set-default
 */
export const setDefaultRegistrantInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const registrantInfo = await RegistrantInfo.findOne({
      _id: id,
      user_id: userId,
    });

    if (!registrantInfo) {
      return res.status(404).json({
        success: false,
        message: 'Registrant information not found',
      });
    }

    // Unset other defaults
    await RegistrantInfo.updateMany(
      { user_id: userId, isDefault: true, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this as default
    registrantInfo.isDefault = true;
    await registrantInfo.save();

    res.status(200).json({
      success: true,
      message: 'Default registrant information set successfully',
      data: registrantInfo,
    });
  } catch (error: any) {
    console.error('Error setting default registrant info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default registrant information',
      error: error.message,
    });
  }
};


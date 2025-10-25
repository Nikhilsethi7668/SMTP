import { Request, Response } from 'express';
import crypto from 'crypto';
import { Types } from 'mongoose';
import Key, { IKey } from '../models/keyModel.js';

type AuthRequest = Request & { user: { id: string } };

// Generate a secure random API key
const generateApiKey = (): string => {
  return `pk_${crypto.randomBytes(24).toString('hex')}`;
};

// Create a new API key for the authenticated user
export const createApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { permissions, rate_limit, expires_at } = req.body;

    // Generate a new API key
    const apiKey = generateApiKey();

    // Create the key document
    const newKey = await Key.create({
      user: new Types.ObjectId(userId),
      key: apiKey,
      permissions: Array.isArray(permissions) ? permissions : ['send'],
      rate_limit: rate_limit || null,
      expires_at: expires_at || null,
    });

    // Return the key info (excluding sensitive data)
    const { key, _id, created_at, expires_at: expiry } = newKey.toObject();
    
    res.status(201).json({
      success: true,
      data: {
        id: _id,
        key,
        created_at,
        expires_at: expiry,
        permissions: newKey.permissions,
        rate_limit: newKey.rate_limit
      }
    });
  } catch (error: any) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? 'API key already exists' : 'Failed to create API key',
      error: error.message
    });
  }
};

// Get all API keys for the authenticated user
export const getUserApiKeys = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    
    const keys = await Key.find({ 
      user: new Types.ObjectId(userId) 
    })
    .select('key permissions rate_limit expires_at last_used_at is_active created_at')
    .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: keys.length,
      data: keys
    });
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API keys',
      error: error.message
    });
  }
};

// Delete an API key
export const deleteApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid API key ID'
      });
    }

    const result = await Key.deleteOne({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'API key not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'API key deleted successfully',
      data: { id }
    });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete API key',
      error: error.message
    });
  }
};

// Deactivate an API key
export const deactivateApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid API key ID'
      });
    }

    const key = await Key.findOneAndUpdate(
      { _id: id, user: userId },
      { is_active: false },
      { new: true }
    );

    if (!key) {
      return res.status(404).json({
        success: false,
        message: 'API key not found or you do not have permission to modify it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'API key deactivated successfully',
      data: { id: key._id, is_active: key.is_active }
    });
  } catch (error: any) {
    console.error('Error deactivating API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate API key',
      error: error.message
    });
  }
};

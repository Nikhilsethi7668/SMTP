import { Request, Response } from 'express';
import crypto from 'crypto';
import * as keyModel from '../models/keyModel.js';

// Generate a secure random API key
const generateApiKey = () => {
  return crypto.randomBytes(24).toString('hex');
};

// Create a new API key for the authenticated user
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id; // Assuming user ID is available in req.user
    const { permissions, rate_limit, expires_at } = req.body;

    const apiKey = generateApiKey();

    const newKey = await keyModel.createKey({
      user_id,
      key: apiKey,
      permissions,
      rate_limit,
      expires_at,
    });

    res.status(201).json({ message: 'API key created successfully', key: newKey });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating API key', error: error.message });
  }
};

// Get all API keys for the authenticated user
export const getUserApiKeys = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id; // Assuming user ID is available in req.user
    const keys = await keyModel.getKeysByUserId(user_id);
    res.status(200).json(keys);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching API keys', error: error.message });
  }
};

// Delete an API key
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    await keyModel.deleteKey(parseInt(id), user_id);

    res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting API key', error: error.message });
  }
};

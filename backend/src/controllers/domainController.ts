import { Request, Response } from 'express';
import { Domain } from '../models/domainModel.js';

export const createDomain = async (req: Request, res: Response) => {
  try {
 
    const domainData = {
      ...req.body,
      user_id: req.user._id,
    };

    const domain = new Domain(domainData);
    await domain.save();

    res.status(201).json(domain);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDomains = async (req: Request, res: Response) => {
  try {
    const domains = await Domain.find({ user_id: req.user._id });
    res.json(domains);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDomainById = async (req: Request, res: Response) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return 
    }

    res.json(domain);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDomain = async (req: Request, res: Response) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['dkim_selector', 'status'];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      res.status(400).json({ error: 'Invalid updates!' });
      return 
    }

    const domain = await Domain.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return 
    }

    res.json(domain);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDomain = async (req: Request, res: Response) => {
  try {
    const domain = await Domain.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return 
    }

    res.json({ message: 'Domain deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDomain = async (req: Request, res: Response) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!domain) {
      res.status(404).json({ message: 'Domain not found' });
      return 
    }

    domain.verified = true;
    domain.status = 'verified';
    domain.last_verified_at = new Date();
    await domain.save();

    res.json({ message: 'Domain verified successfully', domain });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

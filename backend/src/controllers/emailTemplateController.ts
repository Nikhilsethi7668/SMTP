import { Request, Response } from 'express';
import EmailTemplate from '../models/emailTemplateModel.js';
import { Types } from 'mongoose';

interface IEmailTemplateBody {
    campaignId: string;
    subject: string;
    body: string;
    variables?: Array<{ name: string; defaultValue: string }>;
}

// Create new template
export const createTemplate = async (req: Request<{}, {}, IEmailTemplateBody>, res: Response) => {
    try {
        const { campaignId, subject, body, variables } = req.body;

        // Validate campaignId
        if (!Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid campaign ID'
            });
        }

        // Check if template already exists for campaign
        const existingTemplate = await EmailTemplate.findOne({ campaignId });
        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: 'Template already exists for this campaign'
            });
        }

        // Create template
        const template = await EmailTemplate.create({
            campaignId,
            subject,
            body,
            variables: variables || []
        });

        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create template'
        });
    }
};

// Get template by campaign ID
export const getTemplate = async (req: Request<{ campaignId: string }>, res: Response) => {
    try {
        const { campaignId } = req.params;

        if (!Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid campaign ID'
            });
        }

        const template = await EmailTemplate.findOne({ campaignId });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.status(200).json({
            success: true,
            data: template
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch template'
        });
    }
};

// Update template
export const updateTemplate = async (req: Request<{ campaignId: string }, {}, Partial<IEmailTemplateBody>>, res: Response) => {
    try {
        const { campaignId } = req.params;
        const updates = req.body;

        if (!Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid campaign ID'
            });
        }

        const template = await EmailTemplate.findOne({ campaignId });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Apply updates
        if (updates.subject) template.subject = updates.subject;
        if (updates.body) template.body = updates.body;
        if (updates.variables) template.variables = updates.variables;
        
        // Increment version
        template.version += 1;
        
        await template.save();

        res.status(200).json({
            success: true,
            data: template
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update template'
        });
    }
};

// Track link click
export const trackLinkClick = async (req: Request<{ campaignId: string }, {}, { url: string }>, res: Response) => {
    try {
        const { campaignId } = req.params;
        const { url } = req.body;

        if (!Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid campaign ID'
            });
        }

        const template = await EmailTemplate.findOne({ campaignId });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        await template.incrementLinkClicks(url);

        res.status(200).json({
            success: true,
            message: 'Click tracked successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to track link click'
        });
    }
};

// Delete template
export const deleteTemplate = async (req: Request<{ campaignId: string }>, res: Response) => {
    try {
        const { campaignId } = req.params;

        if (!Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid campaign ID'
            });
        }

        const template = await EmailTemplate.findOneAndDelete({ campaignId });
        
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete template'
        });
    }
};
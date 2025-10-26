import { Response } from 'express';
import { TypedRequestBody, TypedRequestQuery, TypedRequest } from '../types/express/index.js';
import IncomingEmail from '../models/incomingEmailModel.js';
import Leads from '../models/leadModel.js';

interface CreateIncomingEmailBody {
    from: string;
    to: string;
    subject: string;
    body: string;
    headers?: Record<string, any>;
    metadata?: Record<string, any>;
}

interface GetIncomingEmailQuery {
    campaign?: string;
    to?: string;
    status?: string;
    limit?: string;
    page?: string;
}

export const createIncomingEmail = async (
    req: TypedRequestBody<CreateIncomingEmailBody>,
    res: Response
) => {
    try {
        const { from, to, subject, body, headers, metadata } = req.body;

        if (!from || !to || !subject || !body) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: from, to, subject, and body are required'
            });
        }

        const lead = await Leads.findOne({ 
            email: to.toLowerCase().trim() 
        });

        let campaignId = null;
        if (lead) {
            campaignId = lead.campaign;
        }

        const incomingEmail = await IncomingEmail.create({
            from: from.toLowerCase().trim(),
            to: to.toLowerCase().trim(),
            subject,
            body,
            headers,
            campaign: campaignId,
            metadata: {
                ...metadata,
                leadFound: !!lead,
                matchedLeadId: lead?._id
            }
        });

        res.status(201).json({
            success: true,
            data: incomingEmail,
            message: lead 
                ? `Incoming email created and linked to campaign: ${campaignId}` 
                : 'Incoming email created (no matching lead found)'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to create incoming email',
            error: error.message
        });
    }
};

export const getIncomingEmails = async (
    req: TypedRequestQuery<GetIncomingEmailQuery>,
    res: Response
) => {
    try {
        const { campaign, to, status, limit = '50', page = '1' } = req.query;

        const filter: any = {};
        
        if (campaign) filter.campaign = campaign;
        if (to) filter.to = to.toLowerCase().trim();
        if (status) filter.status = status;

        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);
        const skip = (pageNum - 1) * limitNum;

        const incomingEmails = await IncomingEmail.find(filter)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip)
            .populate('campaign', 'name subject');

        const total = await IncomingEmail.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: incomingEmails.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: incomingEmails
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incoming emails',
            error: error.message
        });
    }
};

export const getIncomingEmailById = async (
    req: TypedRequest<any, { id: string }>,
    res: Response
) => {
    try {
        const { id } = req.params;

        const incomingEmail = await IncomingEmail.findById(id)
            .populate('campaign', 'name subject from_email');

        if (!incomingEmail) {
            return res.status(404).json({
                success: false,
                message: 'Incoming email not found'
            });
        }

        res.status(200).json({
            success: true,
            data: incomingEmail
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incoming email',
            error: error.message
        });
    }
};

export const updateIncomingEmailStatus = async (
    req: TypedRequest<{ status: 'received' | 'processed' | 'failed' }, { id: string }>,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const incomingEmail = await IncomingEmail.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!incomingEmail) {
            return res.status(404).json({
                success: false,
                message: 'Incoming email not found'
            });
        }

        res.status(200).json({
            success: true,
            data: incomingEmail
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update incoming email',
            error: error.message
        });
    }
};

export const getIncomingEmailsByCampaign = async (
    req: TypedRequest<any, { campaignId: string }>,
    res: Response
) => {
    try {
        const { campaignId } = req.params;

        const incomingEmails = await IncomingEmail.find({ campaign: campaignId })
            .sort({ createdAt: -1 })
            .populate('campaign', 'name subject');

        res.status(200).json({
            success: true,
            count: incomingEmails.length,
            data: incomingEmails
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch incoming emails by campaign',
            error: error.message
        });
    }
};
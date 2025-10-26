// src/controllers/leadsController.ts
import { Response } from 'express';
import { TypedRequestBody, TypedRequestQuery, TypedRequest } from '../types/express/index.js';
import Leads from '../models/leadModel.js';
import { Readable } from 'stream';
import csv from 'csv-parser';

// Types for request bodies and queries
interface LeadBody {
    email: string;
    email_secure_gateway?: string;
    status?: string;
    campaign:string;
}

interface LeadQuery {
    status?: string;
    provider?: string;
    campaign?: string;
}

interface CSVRequestBody {
    file: Express.Multer.File;
}

// Add a single lead
export const addLead = async (
    req: TypedRequestBody<LeadBody>, 
    res: Response
) => {
    try {
        const { email, email_secure_gateway, campaign, status } = req.body;
        const user = req.user._id;
        const lead = await Leads.create({
            email,
            user,
            campaign,
            email_secure_gateway: email_secure_gateway || 'default_gateway',
            status: status || 'pending'
        });

        res.status(201).json({
            success: true,
            data: lead
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to add lead',
            error: error.message
        });
    }
};

export const uploadLeadsCSV = async (
    req: TypedRequest<CSVRequestBody, {}> & { file: Express.Multer.File },
    res: Response
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No CSV file uploaded'
            });
        }
        const user = req.user._id;
        const campaign = (req as any).query.campaign as string;

        const results: { email: string }[] = [];
        const errors: { email: string; error: string }[] = [];
        const buffer = req.file.buffer;
        const stream = Readable.from(buffer.toString());

        // Process CSV
        await new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on('data', (data) => {
                    if (data.email) {
                        results.push({ email: data.email });
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Process each email
        const savedLeads = [];
        for (const { email } of results) {
            try {
                // Check if email already exists
                const existingLead = await Leads.findOne({ email });
                if (!existingLead) {
                    const lead = await Leads.create({
                        email,
                        email_secure_gateway: 'default_gateway',
                        status: 'pending',
                        user,
                        campaign
                    });
                    savedLeads.push(lead);
                }
            } catch (error: any) {
                errors.push({ 
                    email, 
                    error: error.message || 'Failed to process email' 
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'CSV processed successfully',
            data: {
                processed: results.length,
                saved: savedLeads.length,
                duplicates: results.length - savedLeads.length - errors.length,
                errors
            }
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to process CSV',
            error: error.message
        });
    }
};

// Get all leads
export const getLeads = async (
    req: TypedRequestQuery<LeadQuery>,
    res: Response
) => {
    try {
        const { status, provider } = req.query;
        const user = req.user._id;
        const campaign = req.query.campaign as string;
        const filter: any = {};

        if (status) filter.status = status;
        if (provider) filter.provider = provider;
        if (campaign) filter.campaign = campaign;
        if (user) filter.user = user;
        const leads = await Leads.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leads',
            error: error.message
        });
    }
};
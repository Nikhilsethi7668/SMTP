import mongoose, { Document, Model } from 'mongoose';

// Define interfaces for the document and model
interface ILink {
    url?: string;
    tracked: boolean;
    clicks: number;
}

interface IVariable {
    name?: string;
    defaultValue?: string;
}

interface IEmailTemplate {
    campaignId: mongoose.Types.ObjectId;
    subject: string;
    body: string;
    links: ILink[];
    variables: IVariable[];
    version: number;
    lastModified: Date;
}

// Create interface for the document
interface IEmailTemplateDocument extends IEmailTemplate, Document {
    incrementLinkClicks(url: string): Promise<void>;
    validateVariables(variables: Record<string, string>): {
        isValid: boolean;
        missingVariables: string[];
    };
}

// Create interface for the model
interface IEmailTemplateModel extends Model<IEmailTemplateDocument> {}

const emailTemplateSchema = new mongoose.Schema<IEmailTemplateDocument, IEmailTemplateModel>({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
        unique: true, 
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    links: [{
        url: String,
        tracked: {
            type: Boolean,
            default: true
        },
        clicks: {
            type: Number,
            default: 0
        }
    }],
    variables: [{
        name: String,
        defaultValue: String
    }],
    version: {
        type: Number,
        default: 1
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to extract URLs from body
emailTemplateSchema.pre('save', function(next) {
    try {
        // Reset links array
        const links: ILink[] = [];
        
        // Regular expression to match URLs
        const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/g;
        
        // Find all URLs in the body
        const matches = this.body.match(urlRegex) || [];
        
        // Create unique set of URLs
        const uniqueUrls = [...new Set(matches)];
        
        // Add each unique URL to the links array
        uniqueUrls.forEach(url => {
            links.push({
                url: url.startsWith('http') ? url : `http://${url}`,
                tracked: true,
                clicks: 0
            });
        });

        // Update links and lastModified
        this.links = links;
        this.lastModified = new Date();
        
        next();
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error during save'));
    }
});

// Validation to ensure campaignId is unique
emailTemplateSchema.index({ campaignId: 1 }, { unique: true });

// Method to increment click count for a specific link
emailTemplateSchema.methods.incrementLinkClicks = async function(url: string): Promise<void> {
    const linkIndex = this.links.findIndex((link: ILink) => link.url === url);
    if (linkIndex !== -1) {
        this.links[linkIndex].clicks += 1;
        await this.save();
    }
};

// Method to validate template variables
emailTemplateSchema.methods.validateVariables = function(variables: Record<string, string>): {
    isValid: boolean;
    missingVariables: string[];
} {
    const templateVars = this.variables.map((v: IVariable) => v.name).filter((name: string | undefined): name is string => name !== undefined);
    const missingVars = templateVars.filter((v: string) => !(v in variables));
    return {
        isValid: missingVars.length === 0,
        missingVariables: missingVars
    };
};

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;
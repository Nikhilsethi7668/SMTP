import mongoose, { model, Schema, Document } from "mongoose";

type EmailProvider = 'gmail' | 'yahoo' | 'outlook' | 'icloud' | 'aol' | 'protonmail' | 'zoho' | 'yandex' | 'other';

interface ILead extends Document {
    email: string;
    user: mongoose.Types.ObjectId;
    campaign: mongoose.Types.ObjectId;
    provider: EmailProvider;
    email_secure_gateway: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema = new Schema<ILead>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    provider: {
        type: String as any,
        required: true,
        enum: ['gmail', 'yahoo', 'outlook', 'icloud', 'aol', 'protonmail', 'zoho', 'yandex', 'other'],
        default: 'other' as const
    },
    email_secure_gateway: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
}, { timestamps: true });

LeadSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        const email = this.email;
        const domain = email.split('@')[1]?.toLowerCase() || '';
        
        const providerMap: {[key: string]: EmailProvider} = {
            'gmail.com': 'gmail',
            'googlemail.com': 'gmail',
            'yahoo.com': 'yahoo',
            'ymail.com': 'yahoo',
            'outlook.com': 'outlook',
            'hotmail.com': 'outlook',
            'live.com': 'outlook',
            'icloud.com': 'icloud',
            'me.com': 'icloud',
            'aol.com': 'aol',
            'protonmail.com': 'protonmail',
            'proton.me': 'protonmail',
            'zoho.com': 'zoho',
            'yandex.com': 'yandex',
            'yandex.ru': 'yandex'
        };

        this.provider = providerMap[domain] || 'other';
    }
    next();
});

export default model<ILead>('Lead', LeadSchema);
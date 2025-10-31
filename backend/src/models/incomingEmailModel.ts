import mongoose, { model, Schema, Document } from "mongoose";

export interface IIncomingEmail extends Document {
    from: string;
    to: string;
    subject: string;
    body: string;
    headers?: Record<string, any>;
    campaign: mongoose.Types.ObjectId | null;
    status: 'received' | 'processed' | 'failed';
    read: boolean;
    metadata?: Record<string, any>;
    receivedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user_id: mongoose.Types.ObjectId;
}

const IncomingEmailSchema = new Schema<IIncomingEmail>({
    from: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    to: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    headers: {
        type: Schema.Types.Mixed
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: 'Campaign',
        required: false,
        default: null
    },
    status: {
        type: String,
        enum: ['received', 'processed', 'failed'],
        default: 'received'
    },
    read: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: Schema.Types.Mixed
    },
    receivedAt: {
        type: Date,
        default: Date.now
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

IncomingEmailSchema.index({ to: 1 });
IncomingEmailSchema.index({ campaign: 1 });
IncomingEmailSchema.index({ createdAt: -1 });

export default model<IIncomingEmail>('IncomingEmail', IncomingEmailSchema);
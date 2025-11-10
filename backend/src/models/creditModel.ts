import mongoose, { Schema, Document } from "mongoose";

export interface ICredit extends Document {
  user_id: mongoose.Types.ObjectId;
  email_credits: number;
  verification_credits: number;
  total_credits: number; // Calculated field: email_credits + verification_credits
  createdAt: Date;
  updatedAt: Date;
}

const CreditSchema = new Schema<ICredit>(
  {
    user_id: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    email_credits: { 
      type: Number, 
      default: 0,
      min: 0
    },
    verification_credits: { 
      type: Number, 
      default: 0,
      min: 0
    },
    total_credits: { 
      type: Number, 
      default: 0,
      min: 0
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total_credits
CreditSchema.pre('save', function(next) {
  this.total_credits = this.email_credits + this.verification_credits;
  next();
});

export const Credit = mongoose.model<ICredit>("Credit", CreditSchema);


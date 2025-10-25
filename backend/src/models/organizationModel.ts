import mongoose, { Schema, Document } from "mongoose";

export interface IOrg extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrgSchema = new Schema<IOrg>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Org = mongoose.model<IOrg>("Org", OrgSchema);

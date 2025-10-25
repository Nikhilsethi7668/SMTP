import { Org, IOrg } from "../models/organizationModel.js";
import mongoose from "mongoose";

export class OrganizationService {
  // ✅ Create a new organization
  static async createOrg(name: string): Promise<IOrg> {
    // Check if org exists
    const existing = await Org.findOne({ name });
    if (existing) throw new Error("Organization already exists");

    const org = await Org.create({ name });
    return org;
  }

  // ✅ Get organization by ID
  static async getOrgById(id: string): Promise<IOrg | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Org.findById(id);
  }

  // ✅ Get organization by name
  static async getOrgByName(name: string): Promise<IOrg | null> {
    return await Org.findOne({ name });
  }

  // ✅ Update organization name
  static async updateOrg(id: string, name: string): Promise<IOrg | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updated = await Org.findByIdAndUpdate(
      id,
      { $set: { name, updatedAt: new Date() } },
      { new: true }
    );
    return updated;
  }

  // ✅ List all organizations
  static async getAllOrgs(): Promise<IOrg[]> {
    const data = (await Org.find({}, { name: 1, createdAt: 1, updatedAt: 1 }).lean()) as unknown as IOrg[];
    return data;
  }

  // ✅ Delete organization
  static async deleteOrg(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid organization ID");
    await Org.deleteOne({ _id: id });
  }
}

import mongoose, { Schema, Document, Model } from "mongoose";

// ============================================================================
// INTERFACES
// ============================================================================

// Email interface for pre-warmed domains
export interface IPreWarmedEmail {
  email: string;
  persona: string;
  status: "available" | "warmingup" | "warmingup_failed" | "warmingup_completed";
  provider: "gmail" | "outlook" | "custom";
  price: number;
}

// Unified Domain Interface combining all three models
export interface IUnifiedDomain extends Document {
  // Common fields
  domain: string; // Main domain name (used by all types)
  domain_name?: string; // Alternative name field (from Domain model)
  userId?: mongoose.Types.ObjectId; // User reference
  
  // Domain type discriminator
  domainType: "preWarmed" | "verified" | "purchased";
  
  // PreWarmed Domain fields
  emails?: IPreWarmedEmail[];
  forwarding?: string;
  domainPrice?: number; // Annual domain price
  emailPrice?: number; // Monthly price per email
  status?: "available" | "reserved" | "purchased"; // PreWarmed status
  reservedUntil?: Date;
  reservedBy?: mongoose.Types.ObjectId;
  warmingup?: boolean;
  
  // Domain Verification fields (from Domain model)
  dkim_selector?: string;
  dkim_public_key?: string;
  dkim_private_key?: string;
  spf_record?: string;
  dmarc_record?: string;
  verified?: boolean;
  verificationStatus?: "pending" | "verified" | "failed" | "disabled"; // Domain verification status
  
  // Purchased Domain fields (from PurchasedDomain model)
  sld?: string;
  tld?: string;
  orderId?: string;
  purchaseStatus?: "pending" | "active" | "failed" | "expired"; // Purchase status
  years?: number;
  expirationDate?: Date;
  purchaseDate?: Date;
  price?: number;
  registrantInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    organizationName?: string;
  };
  enomResponse?: any; // Store full Enom API response for reference
  
  // Common timestamps
  last_verified_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy interfaces for backward compatibility
export interface IPreWarmedDomain extends Document {
  domain: string;
  emails: IPreWarmedEmail[];
  forwarding?: string;
  userId?: mongoose.Types.ObjectId;
  domainPrice: number;
  emailPrice: number;
  status: "available" | "reserved" | "purchased";
  reservedUntil?: Date;
  reservedBy?: mongoose.Types.ObjectId;
  warmingup: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDomain extends Document {
  userId: mongoose.Types.ObjectId;
  domain_name: string;
  dkim_selector: string;
  dkim_public_key?: string;
  dkim_private_key?: string;
  spf_record?: string;
  dmarc_record?: string;
  verified: boolean;
  last_verified_at?: Date;
  status: 'pending' | 'verified' | 'failed' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchasedDomain extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  sld: string;
  tld: string;
  orderId: string;
  status: 'pending' | 'active' | 'failed' | 'expired';
  years: number;
  expirationDate?: Date;
  purchaseDate: Date;
  price: number;
  registrantInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    organizationName?: string;
  };
  enomResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const PreWarmedEmailSchema = new Schema<IPreWarmedEmail>(
  {
    email: { type: String, required: true },
    persona: { type: String, required: true },
    status: { type: String, enum: ["available", "warmingup"], default: "available" },
    provider: {
      type: String,
      enum: ["gmail", "outlook", "custom"],
      default: "gmail",
    },
    price: { type: Number, required: true, default: 10 },
  },
  { _id: false }
);

const RegistrantInfoSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address1: { type: String, required: true },
    city: { type: String, required: true },
    stateProvince: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    organizationName: { type: String },
  },
  { _id: false }
);

const UnifiedDomainSchema = new Schema<IUnifiedDomain>(
  {
    // Common fields
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    domain_name: {
      type: String,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },    
    // Domain type discriminator
    domainType: {
      type: String,
      enum: ["preWarmed", "verified", "purchased"],
      required: true,
      index: true,
    },
    
    // PreWarmed Domain fields
    emails: [{
      type: Schema.Types.ObjectId,
    ref: "EmailAccount",
    }],
    forwarding: {
      type: String,
      trim: true,
    },
    domainPrice: {
      type: Number,
      default: 15, // Annual price
    },
    emailPrice: {
      type: Number,
      default: 10, // Monthly price per email
    },
    status: {
      type: String,
      enum: ["available", "reserved", "purchased"],
      default: "available",
    },
    reservedUntil: {
      type: Date,
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    warmingup: {
      type: Boolean,
    },
    
    // Domain Verification fields
    dkim_selector: {
      type: String,
      default: "default",
    },
    dkim_public_key: {
      type: String,
    },
    dkim_private_key: {
      type: String,
    },
    spf_record: {
      type: String,
    },
    dmarc_record: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed", "disabled"],
      default: "pending",
    },
    last_verified_at: {
      type: Date,
    },
    
    // Purchased Domain fields
    sld: {
      type: String,
      trim: true,
    },
    tld: {
      type: String,
      trim: true,
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
    },
    purchaseStatus: {
      type: String,
      enum: ["pending", "active", "failed", "expired"],
      default: "pending",
    },
    years: {
      type: Number,
      default: 1,
    },
    expirationDate: {
      type: Date,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
    },
    registrantInfo: {
      type: RegistrantInfoSchema,
    },
    enomResponse: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Compound indexes for faster queries
UnifiedDomainSchema.index({ domainType: 1, domain: 1 });
UnifiedDomainSchema.index({ domainType: 1, status: 1 });
UnifiedDomainSchema.index({ domainType: 1, userId: 1 });
UnifiedDomainSchema.index({ orderId: 1 });
UnifiedDomainSchema.index({ domainType: 1, verificationStatus: 1 });
UnifiedDomainSchema.index({ domainType: 1, purchaseStatus: 1 });

// ============================================================================
// BASE MODEL
// ============================================================================

export const UnifiedDomain = mongoose.model<IUnifiedDomain>(
  "UnifiedDomain",
  UnifiedDomainSchema
);

// ============================================================================
// TYPE-SPECIFIC MODEL WRAPPERS
// ============================================================================

// Helper function to create type-specific query builders
function createTypeSpecificModel<T extends Document>(
  baseModel: Model<T>,
  domainType: "preWarmed" | "verified" | "purchased"
): Model<T> {
  const model = baseModel as any;
  
  // Override find methods to automatically filter by domainType
  const originalFind = model.find.bind(model);
  const originalFindOne = model.findOne.bind(model);
  const originalFindById = model.findById.bind(model);
  const originalFindOneAndUpdate = model.findOneAndUpdate.bind(model);
  const originalFindOneAndDelete = model.findOneAndDelete.bind(model);
  const originalCreate = model.create.bind(model);
  const originalCountDocuments = model.countDocuments.bind(model);
  const originalDeleteMany = model.deleteMany.bind(model);
  const originalDeleteOne = model.deleteOne.bind(model);
  const originalUpdateMany = model.updateMany.bind(model);
  const originalUpdateOne = model.updateOne.bind(model);

  // Helper to merge domainType into conditions
  const mergeDomainType = (conditions: any) => {
    if (!conditions) return { domainType };
    if (typeof conditions === 'string' || mongoose.Types.ObjectId.isValid(conditions)) {
      // It's an ID string - we'll filter in the query chain
      return conditions;
    }
    if (conditions._id && !conditions.domainType) {
      // Has _id but no domainType
      return { ...conditions, domainType };
    }
    return { ...conditions, domainType };
  };

  // Create a constructor function that can be used with 'new'
  // This wraps the base model constructor to automatically set domainType
  const TypeSpecificModel: any = function(this: any, doc?: any) {
    // Ensure domainType is set
    const docWithType = doc ? { ...doc, domainType } : { domainType };
    // Use the base model constructor - Mongoose handles 'new' internally
    return new model(docWithType);
  };

  // Set up prototype chain - inherit from base model
  TypeSpecificModel.prototype = model.prototype;
  TypeSpecificModel.prototype.constructor = TypeSpecificModel;

  // Copy all properties from base model
  Object.setPrototypeOf(TypeSpecificModel, model);
  Object.assign(TypeSpecificModel, model);
  
  // Override query methods
  TypeSpecificModel.find = function(conditions?: any, projection?: any, options?: any) {
    const mergedConditions = mergeDomainType(conditions);
    const query = originalFind(mergedConditions, projection, options);
    // If conditions was an ID string, add domainType filter
    if (typeof conditions === 'string' || (conditions && !conditions.domainType && mongoose.Types.ObjectId.isValid(conditions))) {
      return query.where("domainType").equals(domainType);
    }
    return query;
  };
  
  TypeSpecificModel.findOne = function(conditions?: any, projection?: any, options?: any) {
    const mergedConditions = mergeDomainType(conditions);
    const query = originalFindOne(mergedConditions, projection, options);
    // If conditions was an ID string, add domainType filter
    if (typeof conditions === 'string' || (conditions && !conditions.domainType && mongoose.Types.ObjectId.isValid(conditions))) {
      return query.where("domainType").equals(domainType);
    }
    return query;
  };
  
  TypeSpecificModel.findById = function(id: any, projection?: any, options?: any) {
    const query = originalFindById(id, projection, options);
    return query.where("domainType").equals(domainType);
  };
  
  TypeSpecificModel.findOneAndUpdate = function(conditions?: any, update?: any, options?: any) {
    return originalFindOneAndUpdate(mergeDomainType(conditions), update, options);
  };
  
  TypeSpecificModel.findOneAndDelete = function(conditions?: any, options?: any) {
    return originalFindOneAndDelete(mergeDomainType(conditions), options);
  };
  
  TypeSpecificModel.create = function(doc: any) {
    if (Array.isArray(doc)) {
      return originalCreate(doc.map(d => ({ ...d, domainType })));
    }
    return originalCreate({ ...doc, domainType });
  };
  
  TypeSpecificModel.countDocuments = function(conditions?: any, options?: any) {
    return originalCountDocuments(mergeDomainType(conditions), options);
  };
  
  TypeSpecificModel.deleteMany = function(conditions?: any, options?: any) {
    return originalDeleteMany(mergeDomainType(conditions), options);
  };
  
  TypeSpecificModel.deleteOne = function(conditions?: any, options?: any) {
    return originalDeleteOne(mergeDomainType(conditions), options);
  };
  
  TypeSpecificModel.updateMany = function(conditions?: any, update?: any, options?: any) {
    return originalUpdateMany(mergeDomainType(conditions), update, options);
  };
  
  TypeSpecificModel.updateOne = function(conditions?: any, update?: any, options?: any) {
    return originalUpdateOne(mergeDomainType(conditions), update, options);
  };

  const originalInsertMany = model.insertMany.bind(model);
  TypeSpecificModel.insertMany = function(docs: any[] | any, options?: any) {
    // Ensure all documents have domainType set
    if (Array.isArray(docs)) {
      const docsWithType = docs.map(doc => ({ ...doc, domainType }));
      return originalInsertMany(docsWithType, options);
    } else {
      // Single document
      return originalInsertMany([{ ...docs, domainType }], options);
    }
  };

  // Copy all static properties
  Object.keys(model).forEach(key => {
    if (typeof (model as any)[key] !== 'function' && !TypeSpecificModel.hasOwnProperty(key)) {
      (TypeSpecificModel as any)[key] = (model as any)[key];
    }
  });
  
  return TypeSpecificModel as any as Model<T>;
}

// Export type-specific models
export const PreWarmedDomain = createTypeSpecificModel<IUnifiedDomain>(
  UnifiedDomain,
  "preWarmed"
) as any;

export const Domain = createTypeSpecificModel<IUnifiedDomain>(
  UnifiedDomain,
  "verified"
) as any;

export const PurchasedDomain = createTypeSpecificModel<IUnifiedDomain>(
  UnifiedDomain,
  "purchased"
) as any;

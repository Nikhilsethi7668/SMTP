import mongoose from "mongoose";

const EmailAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["gmail", "outlook", "custom", "domain"],
    },
    email: { type: String, required: true },
    name: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiry: { type: Date },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      pass: String,
    },
    imap: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      pass: String,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmailAccount ||
  mongoose.model("EmailAccount", EmailAccountSchema);

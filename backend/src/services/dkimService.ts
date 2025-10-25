// src/services/dkimService.ts
import crypto from "crypto";
import { Domain, IDomain } from "../models/domainModel.js";
import mongoose from "mongoose";

/** ✅ Generate DKIM keypair for a domain */
export const generateDKIMKeys = async (selector: string, domain: string) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

  return { selector, domain, publicKey, privateKey };
};

/** ✅ Save DKIM keys to MongoDB */
export const saveDKIMKeys = async (
  domain_id: string | mongoose.Types.ObjectId,
  publicKey: string,
  privateKey: string,
  selector?: string
): Promise<IDomain | null> => {
  const updatedDomain = await Domain.findByIdAndUpdate(
    domain_id,
    {
      dkim_public_key: publicKey,
      dkim_private_key: privateKey,
      ...(selector ? { dkim_selector: selector } : {}),
    },
    { new: true } // return updated document
  );
  return updatedDomain;
};

/** ✅ Generate DKIM DNS TXT record string */
export const generateDKIMDNSRecord = (publicKey: string) => {
  const pubKeyClean = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\n/g, "");

  return `v=DKIM1; k=rsa; p=${pubKeyClean}`;
};

/** ✅ Verify DKIM setup (placeholder: can use dns.promises) */
export const verifyDKIM = async (domain: string, selector: string): Promise<boolean> => {
  // Example: implement DNS TXT lookup using dns.promises.resolveTxt(domain)
  return true;
};

/** ✅ Sign email headers with DKIM for Nodemailer */
export const signEmailWithDKIM = (
  emailOptions: any,
  privateKey: string,
  selector: string,
  domain: string
) => {
  return {
    ...emailOptions,
    dkim: {
      domainName: domain,
      keySelector: selector,
      privateKey,
    },
  };
};
